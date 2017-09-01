<template>
    <div>
        <img id="tempimg" style="display:none" />
        <ul class="upload-images">
            <li v-for="img in images" v-on:mouseover="img.showRemove=true" v-on:mouseout="img.showRemove=false">
                <a v-bind:href="img.url" target="_blank" :class="{set: img.isSet}">
                    <img :src="img.url" />
                </a>
                <a class="upload-images-remove" v-show="img.showRemove&&img.isSet" @click="remove(img)">移除</a>
                <input type="file" v-bind:name="name" :id="'img_'+img.id" v-show="!img.isSet" accept="image/*" @change="add" />
                <input type="hidden" v-bind:name="name+'_file'" v-if="img.edit" v-model="img.url" />
            </li>
        </ul>
        <div class="tooltip" v-show="tooltip" v-html="tooltip"></div>
        <div class="has-error" v-show="err">{{err}}</div>
    </div>
</template>
<script>
import Locale from '../../mixins/locale';
import '../../utils/extend.js';
export default {
    name: 'UploadImage',
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
        //允许上传的文件扩展名数组
        allowExt: {
            type: Array,
            default() {
                return ['.jpg', '.png'];
            }
        }
    },
    data() {
        return {
            selected: 0,
            current: {},
            count: 0,
            err: null,
            images: []
        };
    },
    methods: {
        reset: function () {
            this.images = [];
            this.current = 0;
            this.selected = 0;
            this.count = 0;
            this.newFile();
        },
        remove: function (item) {
            let file = document.getElementById('img_' + item.id);
            try {
                file.value = '';
            } catch (e) {
                file.type = '';
                file.type = 'file';
            }
            this.images.remove(item);
            this.count -= 1;
            this.selected--;
            if (this.current.isSet)
                this.newFile();
        },
        add: function (e) {
            if (!e.target) {
                this.current.url = e;
                this.current.edit = this.current.url.indexOf('/') === 0;
            }
            else {
                let file = e.target;
                let patt1 = new RegExp(this.allowExt.join('|'), 'i');
                if (!patt1.test(file.value)) {
                    this.showError(this.t('i.uploadimage.ext'));
                    return;
                }
                let fileSize = 0;
                if (file.files && file.files[0]) {
                    fileSize = file.files[0].size;
                } else if (navigator.userAgent.indexOf('MSIE') >= 1) {
                    var objImg = document.getElementById('tempimg');
                    objImg.dynsrc = file.value;
                    fileSize = objImg.fileSize;
                }
                if (fileSize > this.maxLength * 1024) {
                    this.showError(this.t('i.uploadimage.maxSize').replace('#size#', this.maxLength / 1024));
                    return;
                }
                if (file.files && file.files[0]) {
                    this.current.url = window.URL.createObjectURL(file.files[0]);
                } else {
                    this.current.url = document.getElementById(e.target).value;
                }
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
            var img = { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUI0MTgzM0I0OEUwMTFFNkFDNEZBMDYzNkE3NzgzNDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUI0MTgzM0M0OEUwMTFFNkFDNEZBMDYzNkE3NzgzNDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBQjQxODMzOTQ4RTAxMUU2QUM0RkEwNjM2QTc3ODM0NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBQjQxODMzQTQ4RTAxMUU2QUM0RkEwNjM2QTc3ODM0NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pr9l1EoAAArGSURBVHjarFx9rFxF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', showRemove: false, id: this.maxId, isSet: false };
            this.images.push(img);
            this.current = img;
        },
        showError: function(err) {
            this.err = err;
            this.$emit('err', this.err);
            this.$root.$emit('err', this.err);
        },
        isValid: function() {
            if (this.selected<this.min)
            {
                this.showError(this.t('i.uploadimage.min').replace('#min#', this.min));
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
