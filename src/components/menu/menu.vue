<template>
    <div class="nav" :class="cls">
        <ul>
            <Menu-itm v-for="(item,index) in datas" :key="item.id" :data="item" :iconPrefix="iconPrefix" @on-selected="onSelected">
            </Menu-itm>
        </ul>
    </div>
</template>
<script>
import MenuItm from './menu-item.vue';

export default {
    name: 'Menu',
    components: { MenuItm },
    props: {
        datas: {
            type: Array,
            default() {
                return [];
            }
        },
        cls: String,
        iconPrefix: {
            type: String,
            default: 'fa fa-'
        }
    },
    methods: {
        onSelected(data) {
            this.$emit('on-selected', data);
        }
    }
};
</script>
