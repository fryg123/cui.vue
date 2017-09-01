<template>
<div>
    <Tree ref="tree" :data="baseData" show-checkbox @on-check-change="handleChange" @on-toggle-expand="showExpand" sortable @on-sort="sort"></Tree>
    <Button @click="getId">获取Id</Button>
    
    <Button @click="setIds([10,11])">设置Id1</Button>
    
    <Button @click="setIds([10])">设置Id2</Button>

    <Button @click="testSort">测试排序</Button>
</div>
</template>
<script>
    import tree from '../data/tree.js';

    export default {
        data () {
            return {
                bd: [],
                baseData:[]
            }
        },
        methods: {
            testSort(){
                console.log("Sortable:", Sortable);
            },
            setIds(ids) {
                this.$refs.tree.setCheckedNodes(ids);
            },
            getId() {
                console.log("select:", this.$refs.tree.getCheckedIds());
            },
            sort(items) {
                console.log("sort:", items);
            },
            handleSelectChange (data) {
                console.log(data);
            },
            updateTree (data) {
                data[0].children[0].checked = true;
//                data[0].children[0].children[0].checked = true;
//                data[0].children[0].children[1].checked = true;
            },
            handleChange () {
                console.log(1)
            },
            showExpand (payload) {
                console.log(payload)
            }
        },
        mounted () {
            this.baseData = tree;
            //this.updateTree(this.baseData);
        }
    }
</script>
