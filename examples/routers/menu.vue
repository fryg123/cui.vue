<template>
<div>
    <h3>菜单演示：</h3>
    <Menu ref="menu" :datas="baseData" @on-selected="handleChange"></Menu>
</div>
</template>
<script>
    import menuData from '../data/menu.js';

    export default {
        data () {
            return {
                baseData:[],
                rootMenu: true
            };
        },
        methods: {
            handleChange (data) {
                console.log("selected menu:", data.text);
            }
        },
        mounted () {
            this.baseData = menuData;
            //this.updateTree(this.baseData);
        }
    };
</script>
