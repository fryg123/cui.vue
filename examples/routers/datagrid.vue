<style>

</style>
<template>
    <datagrid ref="grid" :columns="gridColumns" :edit="editSetting" v-on:query="beforeQuery" :params="{menuId:1,status:0}">
        <!--<div slot="left_buttons" class="btn-group">
            <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                审核
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu">
                <li>
                    <a href="javascript:;" onclick="article_vm.audit(3)">通过申请</a>
                </li>
                <li>
                    <a href="javascript:;" onclick="article_vm.audit(2)">拒绝申请</a>
                </li>
            </ul>
        </div>-->
        <div slot="other_query" class="tb-item">
            <select name="status" class="form-control select2" id="article_collect_status" style="width:100px">
                <option value="" selected>审核状态</option>
            </select>
        </div>
    </datagrid>
</template>
<script>
let _flags = [{id:1, text:'测试1'},{id:2, text:'测试2'}];
export default {
    data() {
        return {
            editSetting: {showAdd:true,showNew:true,delUrl:'/test',saveUrl:'/test'},
            gridColumns: [
                { bind: 'Id', title: '编号', editor: { type: 'text' } },
                {
                    bind: 'Title', title: '标题', format: function (val, data) {
                        return '<a href="/article/' + data.Id + '" target="_blank">' + val + '</a>';
                    },
                    editor: { type: 'text' }
                },
                { bind: 'Flags', title: '标记', format: function (val) {
                                let labels = [];
                                $.each(_flags, function () {
                                    if (val.exists(this.id))
                                        labels.push(this.text);
                                });
                                return labels.join(',');
                            }, editor: {type:'select', data: _flags, multiple: true, dropdownParent: 'root'} }
            ]
        }
    },
    methods: {
        beforeQuery(params) {
            console.log("#####On Query:", params);
        }
    },
    mounted:function() {
        let datas = [
            {Id:1, Title:'test1', Flags: [1,2]},
            {Id:2, Title:'test2', Flags: [2]},
            {Id:3, Title:'test3', Flags: [1]}
        ];
        this.$refs.grid.datas = datas;
    }
}
</script>
