<template>
    <div class="datagrid">
        <div class="table-tb" v-show="showToolbar">
            <div class="table-tb-op pull-left">
                <div class="tb-item">
                    <slot name="left_buttons"></slot>
                    <button @click="add()" type="button" class="btn btn-primary btn-flat" v-if="edit.showAdd">
                        <i class="fa fa-plus"></i>添加</button>
                    <button @click="newItem()" type="button" class="btn btn-primary btn-flat" v-if="edit.showNew">
                        <i class="fa fa-plus"></i>新建</button>
                    <button @click="remove()" type="button" class="btn btn-danger btn-flat" v-if="edit.delUrl" v-bind:disabled="selectedRows==0">
                        <i class="fa fa-minus"></i>删除</button>
                    <button @click="save()" type="button" class="btn btn-success btn-flat" v-if="edit.saveUrl" v-bind:disabled="!editRow||saving">
                        <i class="fa fa-save"></i>{{saving?'保存中...':'保存'}}</button>
                    <button @click="cancel()" type="button" class="btn btn-default btn-flat" v-if="edit.saveUrl" v-bind:disabled="!editRow">
                        <i class="fa fa-undo"></i>取消</button>
                    <slot name="query_opts"></slot>
                </div>
                <slot name="other_query"></slot>
                <div class="tb-item tb-item-date" v-if="dateable">
                    <datepicker :options="dateOptions" v-model="keyword" :placeholder="dateOptions.placeholder"></datepicker>
                </div>
                <div class="tb-item tb-item-keyword" v-if="search">
                    <input type="text" v-model="keyword" class="form-control" placeholder="请输入关键字..." @keyup.13="startQuery" />
                </div>
                <button v-if="search" type="button" @click="startQuery" data-type="q" class="btn btn-info btn-flat" v-bind:disabled="querying">
                    <i class="fa fa-search"></i>{{querying?'查询中...':'查询'}}</button>
            </div>
            <div class="pull-right">
                <slot name="right_buttons"></slot>
                <div class="btn-group" v-if="dataExport.url">
                    <button type="button" class="btn btn-default btn-flat" @click="startExport('1')" :disabled="exporting">{{exporting?'正在导出...':'导出'}}</button>
                    <button type="button" class="btn btn-default btn-flat dropdown-toggle" data-toggle="dropdown">
                        <span class="caret"></span>
                        <span class="sr-only"></span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right" role="menu">
                        <li v-for="item in dataExport.items" :key="item">
                            <a href="#" @click="startExport(item)">{{item}}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="table-container">
            <table :class="['table',css]" :id="id">
                <thead>
                    <tr>
                        <th v-if="edit.delUrl||edit.showSelect" style="width:40px">
                            <div class="table-chk">
                                <Checkbox v-model="selectAll" @on-change="selectRows"></Checkbox>
                            </div>
                        </th>
                        <th v-for="col in columns" :key="col.title" :style="{width:col.width,minWidth:col.width}" @click="sortBy(col)" :class="{sort:col.sort}">{{col.title}}
                            <i v-if="col.sort" :class="sortClass"></i>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in datas" :key="item.Id" @dblclick="startEdit(item)" @click="selectRow(item)">
                        <td v-if="edit.delUrl||edit.showSelect">
                            <div class="table-chk">
                                <Checkbox v-model="item.checked" @on-change="rowChecked"></Checkbox>
                            </div>
                        </td>
                        <td v-for="col in columns" :key="col.title">
                            <div v-if="col.editor">
                                <div v-show="!item.editing" v-html="col.format?col.format(item[col.bind], item,index):getVal(item,col.bind)"></div>
                                <editor v-if="item.editing" v-model="item[col.bind]" :editor="col.editor"></editor>
                            </div>
                            <div v-else v-html="col.format?col.format(getVal(item,col.bind), item, index):getVal(item,col.bind)"></div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td :colspan="columns.length+1">
                            <div class="row" v-if="pagesize>0">
                                <div class="col-sm-5">
                                    <div class="input-group" style="max-width:500px">
                                        <div class="input-group-btn dropup">
                                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                                {{pagesize}}
                                                <span class="fa fa-caret-down"></span>
                                            </button>
                                            <ul class="dropdown-menu dropup">
                                                <li v-for="item in pages" :key="item">
                                                    <a @click="pageSizeBy(item)">{{item}}</a>
                                                </li>
                                            </ul>
                                            <button @click="pageBy('first')" class="btn btn-default" v-bind:disabled="pagination.page<=1">首页</button>
                                            <button @click="pageBy('pre')" class="btn btn-default" v-bind:disabled="pagination.page<=1">上一页</button>
                                        </div>
                                        <span class="input-group-addon" style="border-left:0;border-right:0">第</span>
                                        <input type="text" v-model="pagination.page" class="form-control" style="text-align:center" />
                                        <span class="input-group-addon" style="border-left:0">页，共{{pagination.pageCount}}页</span>
                                        <div class="input-group-btn">
                                            <button @click="pageBy('next')" class="btn btn-default" v-bind:disabled="pagination.page==pagination.pageCount">下一页</button>
                                            <button @click="pageBy('last')" class="btn btn-default" v-bind:disabled="pagination.page==pagination.pageCount">尾页</button>
                                            <a @click="reload()" class="fa fa-refresh"></a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-7" style="height:34px; line-height:34px; text-align:right">
                                    每页面显示 {{pagesize}} 条记录，共 {{pagination.count}} 条记录
                                </div>
                            </div>
                        </td>
                    </tr>
                    <slot name="footer"></slot>
                </tfoot>
            </table>
        </div>
    </div>
</template>
<script>
import '../../utils/extend.js';
import Editor from './editor.vue';
import Datepicker from '../datepicker';
//import DatePicker from '../../picker/date-picker'

//#region DataGrid组件
export default {
    name: 'DataGrid',
    components: { Editor, Datepicker },
    props: {
        //模板Id
        id: { default: '' },
        //编辑模式{ showAdd:是否显示添加按钮, saveUrl:自动保存地址, delUrl:删除后台操作地址, key:Id键名, showSelect:是否显示选择框 }
        edit: {
            default: function () {
                return { key: 'Id', autoload: false };
            }
        },
        //导出地址
        dataExport: {
            default: function () {
                return { url: '', menus: [] };
            }
        },
        //默认表格样式
        css: { default: 'table-green' },
        //表格列设定：[{ bind: 该列绑定到的数据源, title:列标题, format:列内容的自定义格式化回调, editor:{ type:编辑器类型（select和input中的type类型）, data:若type为select则该字段为要绑定的数据源 }}]
        columns: Array,
        //数据源自动获取地址
        url: { type: String, default: '' },
        //是否显示日期选项
        dateable: {
            type: Boolean,
            default: true
        },
        //日期查询选项
        date: {
            default: function () {
                return { enable: false, start: new Date().toFormat('yyyy/MM/dd'), end: new Date().toFormat('yyyy/MM/dd') };
            }
        },
        //分页大小
        pagesize: { default: 20 },
        //自定义分页
        pages: {
            type: Array,
            default: function () {
                return [10, 20, 50, 100];
            }
        },
        //初始查询参数
        params: {
            type: Object, default: function () { return {}; }
        },
        //是否显示过滤选项
        search: { default: true }
    },
    data: function () {
        return {
            selectDate: '',
            //绑定到列表的数据源
            datas: Array,
            //是否显示工具栏
            showToolbar: true,
            //排序
            sort: { by: 'none' },
            //查询状态
            querying: false,
            //正在导出
            exporting: false,
            //分页对象
            pagination: { page: 1, pageCount: 1, count: 0 },
            //关键字查询
            keyword: '',
            //选中行数
            selectedRows: 0,
            //全选
            selectAll: false,
            //是否为保存中
            saving: false,
            //当前正在编辑的行
            editRow: null,
            dateOptions: {
                placeholder: '请选择日期...',
                mode: 'range'
            }
        };
    },
    computed: {
        dateColor: function () {
            return this.date.enable ? '#000' : '#CCC';
        },
        sortClass: function () {
            return 'fa fa-sort-' + this.sort.by;
        }
    },
    created: function () {
        this.tmpData = null;
        if (!this.edit.key)
            this.edit.key = 'Id';
        $(this.columns).each(function (i, col) {
            if (!col.width)
                col.width = 'auto';
        });
    },
    mounted: function () {
        if (!window.datagridHub)
            window.datagridHub = this;
        if (this.url)
            this.startQuery();
            else
            this.datas = [];
    },
    methods: {
        getData(id) {
            for (let i=0;i<this.datas.length;i++) {
                if (this.datas[i][this.edit.key].toString() === id.toString())
                    return this.datas[i];
            }
        },
        //格式化数据（为了自动绑定编辑模式和选择框）
        formatData: function (data) {
            $(data).each(function (i, item) {
                item.editing = false;
                item.checked = false;
            });
            return data;
        },
        getVal: function (data, key) {
            let index = key.indexOf('.');
            if (index > 0) {
                let firstKey = key.substring(0, index);
                data = data[firstKey];
                if (typeof (data) === 'object')
                    return this.getVal(data, key.substring(index + 1));
                else
                    return data;
            }
            return data[key];
        },
        //显示Loading
        showLoading: function () {

        },
        hideLoading: function () {

        },
        //自动查询方法
        startQuery: function () {
            if (window.event) {
                window.event.preventDefault();
                if ($(window.event.target).attr('data-type') === 'q') {
                    this.sort.key = '';
                    this.sort.by = 'none';
                }
            }
            let self = this;
            this.querying = true;
            this.showLoading();
            let queryParams = this.getQueryParams();
            if (this.sort.key) {
                queryParams.sort = this.sort.key;
                queryParams.sortby = this.sort.by;
            }
            $.ajax({
                type: 'POST', url: this.url, data: queryParams, success: function (result) {
                    if (result.count > self.pagesize)
                        self.pagination.pageCount = parseInt(result.count / self.pagesize) + (result.count % self.pagesize > 0 ? 1 : 0);
                    else
                        self.pagination.pageCount = 1;
                    self.pagination.count = result.count;
                    self.datas = self.formatData(result.data);
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest, textStatus, errorThrown);
                    //alert(textStatus + ":" + errorThrown + "\r\n" + XMLHttpRequest.responseText);
                }, complete: function () {
                    self.hideLoading();
                    self.querying = false;
                }
            });
        },
        getQueryParams: function () {
            let data = $.extend({}, this.params);
            data.page = this.pagination.page;
            data.pagesize = this.pagesize;
            data.keyword = this.keyword;
            if (this.date && this.date.enable) {
                let patt = new RegExp('([0-9]{4,4}-[0-9]{2,2}-[0-9]{2,2})','g');
                let result = this.selectDate.match(patt);
                if (result.length === 2) {
                    data.startDate = result[0];
                    data.endDate = result[1];
                }
            }
            window.datagridHub.$emit('query', data);
            return data;
        },
        startExport: function (type) {
            if (window.event)
                window.event.preventDefault();
            this.showLoading();
            let data = this.getQueryParams();
            data.type = type;
            data.act = 'export';
            let self = this;
            this.exporting = true;
            $.ajax({
                type: 'POST', url: this.dataExport.url, data: data, timeout: 36000000, success: function (result) {
                    if (result.succ) {
                        location.href = result.data;
                    } else {
                        alert(result.err || result);
                    }
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest, textStatus, errorThrown);
                    //alert(textStatus + ':' + errorThrown + '\r\n' + XMLHttpRequest.responseText);
                }, complete: function () {
                    self.exporting = false;
                    self.hideLoading();
                }
            });
        },
        //全选/返选
        selectRows: function (isChecked) {
            //let isChecked = event.target.checked;
            this.datas.forEach(item=> {
                item.checked = isChecked;
            });
            // $(this.datas).each(function (index, data) {
            //     data.checked = isChecked;
            // });
            if (isChecked)
                this.selectedRows = this.datas.length;
            else
                this.selectedRows = 0;
        },
        //行选择事件
        rowChecked: function (isChecked) {
            if (isChecked)
                this.selectedRows++;
            else
                this.selectedRows--;
        },
        //分页大小改变
        pageSizeBy: function (pagesize) {
            this.pagesize = pagesize;
            window.datagridHub.$emit('pagesize', this.pagesize);
            this.startQuery();
        },
        //页变更事件
        pageBy: function (act) {
            switch (act) {
                case 'first':
                    if (this.pagination.page > 1) {
                        this.pagination.page = 1;
                        window.datagridHub.$emit('page', 1);
                    }
                    break;
                case 'pre':
                    if (this.pagination.page > 1) {
                        this.pagination.page--;
                        window.datagridHub.$emit('page', this.pagination.page);
                    }
                    break;
                case 'next':
                    if (this.pagination.page < this.pagination.pageCount) {
                        this.pagination.page++;
                        window.datagridHub.$emit('page', this.pagination.page);
                    }
                    break;
                case 'last':
                    if (this.pagination.page < this.pagination.pageCount) {
                        this.pagination.page = this.pagination.pageCount;
                        window.datagridHub.$emit('page', this.pagination.pageCount);
                    }
                    break;
            }
            this.startQuery();
        },
        //排序事件
        sortBy: function (col) {
            if (!col.sort) return;
            if (this.sort.key != col.bind) {
                this.sort.key = col.bind;
                this.sort.by = 'asc';
            } else {
                this.sort.by = this.sort.by === 'desc' ? 'asc' : 'desc';
            }
            this.startQuery();
        },
        //重新加载
        reload: function () {
            window.datagridHub.$emit('reload');
            this.startQuery();
        },
        //开始编辑
        startEdit: function (data) {
            if (!this.edit.saveUrl) return;
            if (this.editRow) {
                if (this.editRow === data || this.editRow.saving) return;
                this.save();
            }
            data.editing = true;
            data.edited = true;
            this.editRow = data;
            this.tmpData = $.extend({}, data);
        },
        //选择行
        selectRow: function (data) {
            if (this.editRow && this.editRow != data)
                this.startEdit(data);
            if (this.selectedRow != data) {
                this.selectedRow = data;
                window.datagridHub.$emit('selectedRow', this.selectedRow);
            }
        },
        //新建
        newItem: function () {
            if (window.event)
                window.event.preventDefault();
            window.datagridHub.$emit('new');
            //datagridHub.$emit('new');
        },
        //添加行
        add: function () {
            if (window.event)
                window.event.preventDefault();
            if (this.editRow) {
                this.save(true);
                return;
            }
            this.tmpData = null;
            let data = { editing: true, checked: false, edited: true };
            if (this.edit.key.startWith('#'))
                data[this.edit.key.substring(1)] = '';
            else
                data[this.edit.key] = '0';
            $(this.columns).each(function (i, col) {
                data[col.bind] = '';
            });
            if (!this.datas) this.datas = [];
            this.datas.insertAt(0, data);
            this.editRow = data;
        },
        //保存行
        save: function (newRow) {
            if (window.event)
                window.event.preventDefault();
            let isNew = this.tmpData === null;
            if (isNew)
                this.tmpData = this.editRow;
            else {
                for (let key in this.editRow)
                    this.tmpData[key] = this.editRow[key];
            }
            let self = this;
            let data = {};
            let isEditorColumn = function (key) {
                for (let i = 0; i < self.columns.length; i++) {
                    if (self.columns[i].bind === key) {
                        if (self.columns[i].editor)
                            return true;
                        return false;
                    }
                }
                return false;
            };
            for (let key in this.tmpData) {
                let editorCol = isEditorColumn(key);
                if (key === this.edit.key || editorCol)
                    data[key] = this.tmpData[key];
            }
            if (!this.edit.key.startWith('#') && !data[this.edit.key]) {
                data[this.edit.key] = '0';
            }
            window.datagridHub.$emit('beforeSave', data);
            this.saving = this.editRow.saving = true;
            if (this.params) {
                for (let key in this.params)
                    data[key] = this.params[key];
            }
            $.ajax({
                type: 'POST', url: this.edit.saveUrl, data: data, success: function (result) {
                    window.datagridHub.$emit('saved', result);
                    if (result.succ) {
                        self.editRow.editing = false;
                        self.editRow.edited = false;
                        self.saving = self.editRow.saving = false;
                        if (isNew && result.data.Id && self.editRow[self.edit.key] != result.data.Id)
                            self.editRow[self.edit.key] = result.data.Id;
                        self.editRow = null;
                        if (isNew)
                            self.pagination.count++;
                        if (newRow)
                            self.add();
                        else if (self.edit.autoload)
                            self.reload();
                    } else {
                        alert(result.data || result);
                    }
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    self.saving = self.editRow.saving = false;
                    console.log(XMLHttpRequest, textStatus, errorThrown);
                    alert(textStatus + ':' + errorThrown + '\r\n' + XMLHttpRequest.responseText);
                }
            });
        },
        getIds: function () {
            let ids = [];
            let self = this;
            $(this.datas).each(function (i, data) {
                if (data.checked)
                    ids.push(data[self.edit.key]);
            });
            return ids;
        },
        //删除
        remove: function () {
            if (window.event)
                window.event.preventDefault();
            let delDatas = this.getIds();
            let datas = this.datas;
            if (this.edit.delUrl) {
                if (delDatas.length === 0) {
                    alert('请选择要删除的记录！');
                    return;
                }
                if (confirm('确定删除选中的[' + delDatas.length + ']条记录？')) {
                    let self = this;
                    let postData = $.extend({ ids: delDatas }, this.params);
                    $.ajax({
                        type: 'POST', url: this.edit.delUrl, data: postData, success: function (result) {
                            if (result.succ) {
                                window.datagridHub.$emit('deleted', result);
                                self.selectedRows = 0;
                                self.selectAll = false;
                                self.reload();
                            } else {
                                alert(result.err || result);
                            }
                        }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(XMLHttpRequest, textStatus, errorThrown);
                            alert(textStatus + ':' + errorThrown + '\r\n' + XMLHttpRequest.responseText);
                        }
                    });
                }
            } else {
                window.datagridHub.$emit('delete', delDatas);
            }
        },
        //取消编辑
        cancel: function () {
            if (window.event)
                window.event.preventDefault();
            if (!this.editRow) return;
            if (this.tmpData) {
                for (let key in this.tmpData)
                    this.editRow[key] = this.tmpData[key];
                this.editRow.editing = false;
                this.editRow.edited = false;
            }
            else
                this.editRow.editing = false;
            if (!this.editRow.Id)
                this.datas.pop();
            this.editRow = null;
            this.tmpData = null;
        }
    }
};
//#endregion
</script>