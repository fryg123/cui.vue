<template>
    <div :class="prefixCls">
        <ul v-if="treeData.length">
            <Tree-node v-for="item in treeData" :key="item" :data="item" visible :multiple="multiple" :show-checkbox="showCheckbox">
            </Tree-node>
        </ul>
        <div :class="[prefixCls + '-empty']" v-else>{{ localeEmptyText }}</div>
    </div>
</template>
<script>
import TreeNode from './node.vue';
import { findComponentsDownward } from '../../utils/assist';
import Emitter from '../../mixins/emitter';
import Locale from '../../mixins/locale';
import Sortable from '../../utils/Sortable';

const prefixCls = 'ivu-tree';

export default {
    name: 'Tree',
    mixins: [Emitter, Locale],
    components: { TreeNode },
    props: {
        data: {
            type: Array,
            default() {
                return [];
            }
        },
        multiple: {
            type: Boolean,
            default: false
        },
        showCheckbox: {
            type: Boolean,
            default: false
        },
        emptyText: {
            type: String
        },
        iconPrefix: {
            type: String,
            default: 'fa fa-'
        },
        sortable: {
            type: Boolean,
            default: false
        },
        dataKey: {
            type: String,
            default: 'id'
        },
        url: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            treeData: [],
            prefixCls: prefixCls
        };
    },
    computed: {
        localeEmptyText() {
            if (this.emptyText === undefined) {
                return this.t('i.tree.emptyText');
            } else {
                return this.emptyText;
            }
        }
    },
    methods: {
        getSelectedNodes() {
            const nodes = findComponentsDownward(this, 'TreeNode');
            return nodes.filter(node => node.data.selected).map(node => node.data);
        },
        getCheckedNodes() {
            const nodes = findComponentsDownward(this, 'TreeNode');
            return nodes.filter(node => node.data.checked).map(node => node.data);
        },
        getCheckedIds() {
            let dataKey = this.dataKey;
            let nodes = this.getCheckedNodes();
            let ids = [];
            nodes.forEach(item=> {
                ids.push(item[dataKey]);
            });
            return ids;
        },
        setCheckedNodes(ids) {
            if (!ids.length) return;
            let dataKey = this.dataKey;
            function setChecked(data) {
                data.forEach(item=> {
                    if (ids.indexOf(item[dataKey]) >-1)
                    {
                        item.checked = true;
                    }else {
                        item.checked = false;
                    }
                    if (item.children) {
                        setChecked(item.children);
                    }
                });
            }
            setChecked(this.treeData);
            this.updateData(false);
        },
        updateData(isInit = true) {
            // init checked status
            function reverseChecked(data) {
                if (data.children && data.children.length) {
                    let checkedLength = 0;
                    data.children.forEach(node => {
                        if (node.children) {
                            node = reverseChecked(node);
                        }
                        if (node.checked) 
                            checkedLength++;
                    });
                    if (isInit) {
                        if (checkedLength >= data.children.length) data.checked = true;
                    } else {
                        data.checked = checkedLength >= data.children.length;
                    }
                    return data;
                } else {
                    return data;
                }
            }

            function forwardChecked(data) {
                if (data.children) {
                    data.children.forEach(node => {
                        if (data.checked) node.checked = true;
                        if (node.children) node = forwardChecked(node);
                    });
                    return data;
                } else {
                    return data;
                }
            }
            this.treeData.map(node => reverseChecked(node)).map(node => forwardChecked(node));
            this.broadcast('TreeNode', 'indeterminate');
        },
        setSortable() {
            if (this.sortable) {
                let self = this;
                let items = this.$el.getElementsByTagName('UL');
                for (let i = 0; i < items.length; i++) {
                    if (i === 0) continue;
                    Sortable.create(items[i], {
                        group: 'group' + i,
                        animation: 100,
                        onSort: function (evt) {
                            let sortItems = [];
                            for (let i = 0; i < evt.from.children.length; i++)
                                sortItems.push(evt.from.children[i].getAttribute('data-id'));
                            self.$emit('on-sort', sortItems);
                        }
                    });
                }
            }
        }
    },
    created() {
        if (this.url) {
            let self = this;
            $.ajax({
                type: 'POST', url: this.url, success: function (result) {
                    self.treeData = result;
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.error(XMLHttpRequest, textStatus, errorThrown);
                }
            });
        }else {
            this.treeData = this.data;
            //this.treeData = JSON.parse(JSON.stringify(this.data));
        }
    },
    mounted() {
        this.updateData();
        this.$on('selected', ori => {
            const nodes = findComponentsDownward(this, 'TreeNode');
            nodes.forEach(node => {
                this.$set(node.data, 'selected', false);
            });
            this.$set(ori, 'selected', true);
        });
        this.$on('on-item-select', data => {
            this.$emit('on-select-item', data);
        });
        this.$on('on-selected', () => {
            this.$emit('on-select-change', this.getSelectedNodes());
        });
        this.$on('checked', () => {
            this.updateData(false);
        });
        this.$on('on-checked', () => {
            this.$emit('on-check-change', this.getCheckedNodes());
        });
        this.$on('toggle-expand', (payload) => {
            this.$emit('on-toggle-expand', payload);
        });
        this.setSortable();
    },
    watch: {
        data(value, oldValue) {
            this.treeData = value;
            //this.treeData = JSON.parse(JSON.stringify(this.data));
            this.$nextTick(() => {
                this.updateData();
                this.broadcast('TreeNode', 'indeterminate');
                this.setSortable();
            });
        }
    }
};
</script>