<template>
    <div>
        <ul class="upload-file">
            <li v-for="item in files" track-by="item" v-on:mouseover="item.showRemove=true" v-on:mouseout="item.showRemove=false" :title="item.name">
                <div :class="{selected:item.isSet}">
                    <a v-if="item.isSet" v-bind:href="item.url" target="_blank">
                        <i class="ivu-icon ivu-icon-document-text"></i>
                    </a>
                    <a v-else>
                        <i class="ivu-icon ivu-icon-ios-plus-empty"></i>
                    </a>
                    <p v-if="item.name">{{item.name}}</p>
                </div>
                <a class="upload-file-remove ivu-icon ivu-icon-ios-close-empty" v-show="item.showRemove&&item.isSet" @click="remove(item)"></a>
                <input type="file" v-bind:name="name" :id="'file_'+item.id" v-show="!item.isSet" @change="add" />
                <input type="hidden" v-bind:name="name+'_file'" v-if="item.edit" v-model="item.url" />
            </li>
        </ul>
        <div class="tooltip-text" v-show="tooltip"><span v-html="tooltip"></span></div>
        <div class="has-error" v-show="err">{{err}}</div>
    </div>
</template>
<script>
import Locale from '../../mixins/locale';
import '../../utils/extend.js';
export default {
    name: 'UploadFile',
    mixins: [Locale],
    props: {
        //最少上传文件数量
        min: {
            type: Number,
            default: 0
        },
        //最大文件数量
        max: {
            type: Number,
            default: 1
        },
        //传到后台的文件名
        name: {
            type: String,
            default: 'file'
        },
        //提示信息
        tooltip: {
            type: String,
            default: null
        },
        //文件大小限制（单位KB）
        maxLength: {
            type: Number,
            default: 2048
        },
        //允许的文件扩展
        allowExt: {
            type: Array,
            default() {
                return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.flv', '.swf', '.mkv', '.avi', '.rm', '.rmvb', '.mpeg', '.mpg', '.ogg', '.ogv', '.mov', '.wmv', '.mp4', '.webm', '.mp3', '.wav', '.mid', '.rar', '.zip', '.tar', '.gz', '.7z', '.bz2', '.cab', '.iso', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.md', '.xml'];
            }
        }
    },
    data() {
        return {
            selected: 0,
            current: {},
            count: 0,
            err: null,
            files: []
        };
    },
    methods: {
        reset: function () {
            this.files = [];
            this.current = 0;
            this.selected = 0;
            this.count = 0;
            this.newFile();
        },
        remove: function (item) {
            let file = document.getElementById('file_' + item.id);
            try {
                file.value = '';
            } catch (e) {
                file.type = '';
                file.type = 'file';
            }
            this.files.remove(item);
            this.count -= 1;
            this.selected--;
            if (this.current.isSet)
                this.newFile();
        },
        preview: function(item) {
            window.open(item.url);
        },
        add: function (e) {
            if (!e.target) {
                this.current.url = e;
                this.current.edit = this.current.url.indexOf('/') === 0;
                if (this.current.edit)
                    this.current.url = this.current.url.substring(this.current.url.lastIndexOf('/'));
                this.current.name = this.current.url;
            }
            else {
                let file = e.target;
                let patt1 = new RegExp(this.allowExt.join('|'), 'i');
                if (!patt1.test(file.value)) {
                    this.showError(this.t('i.uploadfile.ext'));
                    return;
                }
                let fileSize = file.files[0].size;
                if (fileSize > this.maxLength * 1024) {
                    this.showError(this.t('i.uploadfile.maxSize').replace('#size#', this.maxLength / 1024));
                    return;
                }
                if (file.files && file.files[0]) {
                    this.current.url = window.URL.createObjectURL(file.files[0]);
                } else {
                    this.current.url = document.getElementById(e.target).value;
                }
                this.current.name = file.value.substring(file.value.lastIndexOf('\\') + 1);
                this.err = null;
            }
            this.current.isSet = true;
            this.selected++;
            this.newFile();
        },
        newFile: function () {
            if (this.count >= this.max) return;
            this.maxId++;
            this.count++;
            var item = { name: null, showRemove: false, id: this.maxId, isSet: false };
            this.files.push(item);
            this.current = item;
        },
        showError: function(err) {
            this.err = err;
            this.$emit('err', this.err);
            this.$root.$emit('err', this.err);
        },
        isValid: function() {
            if (this.selected<this.min)
            {
                this.showError(this.t('i.uploadfile.min').replace('#min#', this.min));
                return false;
            }
            return true;
        }
    },
    watch: {
        value(val) {
            this.currentValue = val;
        }
    },
    mounted: function () {
        this.maxId = 0;
        this.newFile();
    }
};
</script>
