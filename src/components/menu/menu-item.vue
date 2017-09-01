<template>
    <li :class="selectedCls">
        <a :href="data.children&&data.children.length?null:data.url" @click.prevent="handleClick()">
            <span v-if="data.children&&data.children.length" class="am-icon-angle-left"></span>
            <i :class="this.iconClass"></i>{{data.text}}
        </a>
        <ul v-if="data.children && data.children.length">
            <Menu-itm v-for="(item,index) in data.children" :key="item.id" :data="item">
            </Menu-itm>
        </ul>
    </li>
</template>
<script>
const prefixCls = '';
export default {
    name: 'MenuItm',
    props: {
        data: {
            type: Object,
            default() {
                return {};
            }
        },
        iconPrefix: {
            type: String,
            default: 'fa fa-'
        }
    },
    data() {
        return {
            selectedMenus: []
        };
    },
    computed: {
        iconClass() {
            return this.iconPrefix + this.data.icon;
        },
        selectedCls() {
            return this.data.selected?`${prefixCls}active`:'';
        }
    },
    methods: {
        // checkItems(parent, current, level) {
        //     if (parent.children && parent.children.length) {
        //         let isExists = false;
        //         parent.children.forEach(function(item) {
        //             if (item.id === current.id) {
        //             isExists = true;
        //             }else {
        //                 this.checkItems(item, current, level+1);
        //             }
        //         }, this);
        //         if(isExists) return level;
        //     }
        //     return 0;
        // },
        handleClick() {
            console.log("parent data:", this.$parent.$props.data);
            this.$set(this.data, 'selected', !this.data.selected);
            this.selectedMenus.push(this.data);
            this.$emit('on-selected', this.data);
        }
    }
};
</script>
