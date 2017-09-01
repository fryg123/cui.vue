<template>
    <div>
        <i-select id="country" name="country" :tree="true" placeholder="请选择..." v-model="selected" :options="options" :on-change="onChange">
        </i-select>
        <div>当前选项：{{selected}}</div>
        <div><button @click="value='2'">set values: 2</button></div>
        <div><button @click="setInput">设置input</button></div>
        <div><button @click="getInput">获取input值</button></div>
    </div>
</template>

<script>
HTMLElement.prototype.fireEvent = function (type) {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(type, false, false);
    this.dispatchEvent(evt);
}
import tree from '../data/tree.js'
import tree2 from '../data/tree2.js'
export default {
    data() {
        return {
            value: '1',
            selected: null,
            menu: {id:'1'},
            options: tree2,
            ajaxRes: []
        }
    },
    methods: {
        onChange(val) {
            console.log("on change:",val);
        },
        getInput() {
            var target = document.getElementsByName("country");
            console.log("input value:", target[0].value);
        },
        setInput() {
            var target = document.getElementsByName("country");
            console.log("target:", typeof(target[0]));
            $(target[0]).val("菜单2").trigger('update');
            // var evt = document.createEvent('HTMLEvents');
            // evt.initEvent('update', false, false);
            target[0].fireEvent('update');
            //document.dispatchEvent({type:'update', target:target[0]});
        },
        consoleCallback(data) {
            console.log(data);
        },
        search(search, loading) {
            loading(true)
            this.getRepositories(search, loading, this)
        }
    },
    mounted() {
        $(document.getElementsByName("country")[0]).on('change', function() {
            console.log("input changed!");
        })
    }
}
</script>