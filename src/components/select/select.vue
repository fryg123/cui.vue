<template>
  <div class="dropdown i-select" :class="dropdownClasses" :style="dropdownParent?'position:initial':''">
    <div ref="toggle" @mousedown.prevent="toggleDropdown" class="dropdown-toggle">
      <span class="selected-tag" v-for="option in valueAsArray" v-bind:key="option.index">
        {{getOptionLabel(option)}}
        <button v-if="multiple" @click="deselect(option)" type="button" class="close">
          <span aria-hidden="true">&times;</span>
        </button>
      </span>
  
      <input ref="search" v-model="search" @keydown.delete="maybeDeleteValue" @keyup.esc="onEscape" @keydown.up.prevent="typeAheadUp" @keydown.down.prevent="typeAheadDown" @keyup.enter.prevent="typeAheadSelect" @blur="onSearchBlur" @focus="onSearchFocus" type="search" class="form-control" :placeholder="searchPlaceholder" :readonly="!searchable" :style="{ width: isValueEmpty ? '100%' : 'auto' }" :id="inputId">
  
      <i v-if="!noDrop" ref="openIndicator" role="presentation" class="open-indicator"></i>
  
      <slot name="spinner">
        <div class="spinner" v-show="mutableLoading">Loading...</div>
      </slot>
    </div>
  
    <ul ref="dropdownMenu" v-show="dropdownOpen" class="dropdown-menu" :style="dropdownStyle">
      <li v-if="tree" @mousedown.prevent="treeClick()" style="padding:0 10px">
        <Tree :data="filteredOptions" :show-checkbox="showCheckbox" :multiple="multiple" @on-check-change="treeChecked" @on-select-item="treeSelected"></Tree>
      </li>
      <li v-else v-for="(option, index) in filteredOptions" v-bind:key="index" :class="{ active: isOptionSelected(option), highlight: index === typeAheadPointer }" @mouseover="typeAheadPointer = index">
        <a @mousedown.prevent="select(option)">
          {{ getOptionLabel(option) }}
        </a>
      </li>
      <li v-if="!filteredOptions.length" class="no-options">
        <slot name="no-options">对不起，没有匹配的选项。</slot>
      </li>
    </ul>
    <input data-select-input type="text" style="width:0;height:0;padding:0;border:0;visibility: hidden;" :name="name" v-model="valueAsString" class="form-control" v-on:update="valueChange($event)" :required="required" :id="id" />
  </div>
</template>

<script type="text/babel">
import pointerScroll from '../../mixins/pointerScroll';
import typeAheadPointer from '../../mixins/typeAheadPointer';
import ajax from '../../mixins/ajax';
import '../../utils/pinyin.js';

export default {
  mixins: [pointerScroll, typeAheadPointer, ajax],
  props: {
    dropdownParent: {
      type: String,
      default: null
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    tree: {
      type: Boolean,
      default: false
    },
    value: {
      default: null
    },
    val: {
      default: null
    },
    id: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    /**
     * An array of strings or objects to be used as dropdown choices.
     * If you are using an array of objects, vue-select will look for
     * a `label` key (ex. [{text: 'This is Foo', id: 'foo'}]). A
     * custom label key can be set with the `label` prop.
     * @type {Object}
     */
    options: {
      type: Array,
      default() {
        return []
      },
    },

    /**
     * Sets the max-height property on the dropdown list.
     * @deprecated
     * @type {String}
     */
    maxHeight: {
      type: String,
      default: '400px'
    },

    /**
     * Enable/disable filtering the options.
     * @type {Boolean}
     */
    searchable: {
      type: Boolean,
      default: true
    },

    /**
     * Equivalent to the `multiple` attribute on a `<select>` input.
     * @type {Object}
     */
    multiple: {
      type: Boolean,
      default: false
    },

    /**
     * Equivalent to the `placeholder` attribute on an `<input>`.
     * @type {Object}
     */
    placeholder: {
      type: String,
      default: ''
    },

    /**
     * Sets a Vue transition property on the `.dropdown-menu`. vue-select
     * does not include CSS for transitions, you'll need to add them yourself.
     * @type {String}
     */
    transition: {
      type: String,
      default: 'fade'
    },

    /**
     * Enables/disables clearing the search text when an option is selected.
     * @type {Boolean}
     */
    clearSearchOnSelect: {
      type: Boolean,
      default: true
    },

    /**
     * Close a dropdown when an option is chosen. Set to false to keep the dropdown
     * open (useful when combined with multi-select, for example)
     * @type {Boolean}
     */
    closeOnSelect: {
      type: Boolean,
      default: true
    },

    /**
     * Tells vue-select what key to use when generating option
     * labels when each `option` is an object.
     * @type {String}
     */
    label: {
      type: String,
      default: 'text'
    },
    /* 
    value field
    */
    valueField: {
      type: String,
      default: 'id'
    },
    /**
     * Callback to generate the label text. If {option}
     * is an object, returns option[this.label] by default.
     * @param  {Object || String} option
     * @return {String}
     */
    getOptionLabel: {
      type: Function,
      default(option) {
        if (typeof option === 'object') {
          if (this.label && option[this.label]) {
            return option[this.label]
          }
        }
        return option;
      }
    },
    onFilter: {
      type: Function,
      default(option) {
        let self = this;
        var isObject = typeof option === 'object';
        let filterChildren = function (item, children, parents) {
          let exists = false;
          if (isObject)
            exists = (item[self.label] + item[self.label].toPinYin()).toLowerCase().indexOf(self.search.toLowerCase()) > -1;
          else
            exists = (item + item.toPinYin()).toLowerCase().indexOf(self.search.toLowerCase()) > -1;
          if (exists)
            return exists;
          if (children) {
            parents.push(item);
            children.forEach(cItem => {
              exists = filterChildren(cItem, isObject ? cItem.children : null, parents);
              if (exists) {
                parents.forEach(p => {
                  self.$set(p, 'expand', true);
                });
                return true;
              }
            });
          }
          return exists;
        };
        return filterChildren(option, isObject ? option.children : null, []);
      }
    },
    onChange: {
      type: Function,
      default: null
    },
    /**
     * Enable/disable creating options from searchInput.
     * @type {Boolean}
     */
    taggable: {
      type: Boolean,
      default: false
    },

    /**
     * When true, newly created tags will be added to
     * the options list.
     * @type {Boolean}
     */
    pushTags: {
      type: Boolean,
      default: false
    },

    /**
     * User defined function for adding Options
     * @type {Function}
     */
    createOption: {
      type: Function,
      default(newOption) {
        if (this.datas.length) {
          newOption = { [this.label]: newOption, [this.valueField]: newOption, keyword: newOption + ' ' + newOption.toPinYin() }
        }
        this.$emit('option:created', newOption)
        return newOption
      }
    },

    /**
     * When false, updating the options will not reset the select value
     * @type {Boolean}
     */
    resetOnOptionsChange: {
      type: Boolean,
      default: false
    },

    /**
     * Disable the dropdown entirely.
     * @type {Boolean}
     */
    noDrop: {
      type: Boolean,
      default: false
    },

    /**
     * Sets the id of the input element.
     * @type {String}
     * @default {null}
     */
    inputId: {
      type: String
    }
  },

  data() {
    return {
      dropdownStyle: null,
      search: '',
      oldValues: '',
      open: false,
      mutableValue: null,
      doEvent: false,
      valType: 'String',
      datas: []
    };
  },

  watch: {
    value(value, oldValue) {
      if (value === oldValue) return;
      if (value === this.mutableValue) return;
      let values = [];
      if (value instanceof Array) {
        value.forEach(item=> {
          values.push(item.id);
        });
      }else {
        values.push(value.id);
      }
      this.setValues(values.join(','));
    },
    /**
     * When the value prop changes, update
     * the internal mutableValue.
     * @param  {mixed} val
     * @return {void}
     */
    val(value, oldValue) {
      if (value === oldValue) return;
      //console.log("set val:", value);
      if (value === this.oldValues) return;
      try {
        if (value instanceof Array) {
          this.valType = 'Array';
          value = value.join(',');
        } else {
          this.valType = 'String';
        }
      } catch (e) {
        console.log("err:", value, e.message);
        return;
      }
      this.setValues(value);
    },
    /**
     * Maybe run the onChange callback.
     * @param  {string|object} val
     * @param  {string|object} old
     * @return {void}
     */
    mutableValue(val, old) {
      this.oldValues = this.valueAsString;
      if (!this.doEvent) return;
      this.$emit('update:val', this.valType === 'String' ? this.oldValues : this.oldValues.split(','));
      this.$emit('input', val);
      this.$nextTick(function () {
        this.$input.fireEvent('change');
      });
      if (this.multiple) {
        this.onChange ? this.onChange(val) : null
      } else {
        this.onChange && val !== old ? this.onChange(val) : null
      }
    },

    /**
     * When options change, update
     * the internal datas.
     * @param  {array} val
     * @return {void}
     */
    options(val, oldValue) {
      if (val === oldValue) return;
      console.log("set options:", val);
      this.datas = this.getOptions(val);
      this.setValues(this.val);
    },
    /**
     * Maybe reset the mutableValue
     * when datas change.
     * @return {[type]} [description]
     */
    datas() {
      if (!this.taggable && this.resetOnOptionsChange) {
        this.mutableValue = this.multiple ? [] : null;
      }
    }
  },

  /**
   * Clone props into mutable values,
   * attach any event listeners.
   */
  created() {
    this.doEvent = false;
    this.datas = this.getOptions(this.options);
    this.mutableLoading = this.loading;
    if (this.val instanceof Array) {
      this.valType = 'Array';
      this.setValues(this.val.join(','));
    } else {
      this.setValues(this.val);
    }
    this.$on('option:created', this.maybePushTag);
  },

  mounted() {
    this.$input = document.querySelector('input[data-select-input]');
    this.setDropdownPosition();
    this.$nextTick(() => {
      this.doEvent = true;
    });
  },

  methods: {
    setDropdownPosition() {
      let css = { 'max-height': this.maxHeight, 'width': $(this.$el).width() + 'px'};
      if (this.dropdownParent) {
        css.top = 0;
        css.left = 0;
        let offset = $(this.$el).offset();
        offset.bottom = offset.top + $(this.$el).outerHeight(false);
        let container = {
          height: $(this.$el).outerHeight(false),
          top: offset.top
        };
        container.bottom = offset.top + container.height;
        css.left = offset.left;
        css.top = container.bottom;
        let $offsetParent = $(this.dropdownParent === 'root' ? this.$root.$el : this.dropdownParent);
        let parentOffset = $offsetParent.offset();
        css.top -= parentOffset.top;
        //css.left -= parentOffset.left;
        css.top = css.top + 'px';
        css.left = css.left + 'px';
      }
      this.dropdownStyle = css;
    },
    valueChange(evt) {
      this.setValues(evt.target.value);
    },
    getOptions(options) {
      if (!options || options.length === 0)
        return [];
      let items = options; //JSON.parse(JSON.stringify(options));
      let isObject = typeof items[0] === 'object';
      let newOptions;
      if (!isObject) {
        newOptions = [];
        items.forEach(item => {
          newOptions.push({ [this.label]: item, [this.valueField]: item })
        })
      } else {
        newOptions = items;
      }
      //生成keyword
      newOptions.forEach(option => {
        option.keyword = option[this.label] + " " + option[this.label].toPinYin();
      })
      return newOptions;
    },
    setValues(val) {
      if (this.datas.length === 0)
        return;
      if (val === null || val === undefined) {
        this.mutableValue = this.multiple ? [] : null;
        return;
      }
      if (typeof val != 'string')
        val = val.toString();
      if (this.tree && this.mutableValue && this.mutableValue.length > 0) {
        this.mutableValue.forEach(data => {
          this.$set(data, "selected", false);
          this.$set(data, "checked", false);
        });
      }
      this.mutableValue = this.multiple ? [] : null;
      var values = val.split(',');
      var self = this;
      let findOptions = function (items) {
        items.forEach(data => {
          let value = data[self.valueField].toString();
          if (values.indexOf(value) > -1) {
            if (self.tree) {
              self.$set(data, "selected", true);
              self.$set(data, "checked", true);
            }
            if (self.multiple)
              self.mutableValue.push(data);
            else
              self.mutableValue = data;
          }
          if (data.children)
            findOptions(data.children);
        })
      }
      findOptions(this.datas);
    },
    treeClick() {
      this.open = true;
      this.$refs.search.focus();
    },
    treeChecked(datas) {
      this.mutableValue = [];
      datas.forEach(data => {
        this.mutableValue.push(data);
      });
    },
    treeSelected(data) {
      this.$set(data, 'selected', true);
      this.select(data);
    },
    /**
     * Select a given option.
     * @param  {Object|String} option
     * @return {void}
     */
    select(option) {
      if (this.isOptionSelected(option)) {
        this.deselect(option)
      } else {
        if (this.taggable && !this.optionExists(typeof (option) === 'object' ? option[this.label] : option)) {
          option = this.createOption(option)
        }
        if (this.multiple && !this.mutableValue) {
          this.mutableValue = [option]
        } else if (this.multiple) {
          this.mutableValue.push(option)
        } else {
          this.mutableValue = option
        }
      }
      this.onAfterSelect(option)
    },

    /**
     * De-select a given option.
     * @param  {Object|String} option
     * @return {void}
     */
    deselect(option) {
      if (this.multiple) {
        let ref = -1
        this.mutableValue.forEach((val) => {
          if (val === option || val[this.label] === option[this.label]) {
            ref = val;
            if (this.tree) {
              this.$set(val, 'checked', false);
              this.$set(val, 'selected', false);
            }
          }
        })
        var index = this.mutableValue.indexOf(ref)
        this.mutableValue.splice(index, 1)
      } else {
        this.mutableValue = null
      }
    },

    /**
     * Called from this.select after each selection.
     * @param  {Object|String} option
     * @return {void}
     */
    onAfterSelect(option) {
      if (this.closeOnSelect) {
        this.open = !this.open
        this.$refs.search.blur()
      }

      if (this.clearSearchOnSelect) {
        this.search = ''
      }
      this.$nextTick(() => {
        this.setDropdownPosition();
      })
    },

    /**
     * Toggle the visibility of the dropdown menu.
     * @param  {Event} e
     * @return {void}
     */
    toggleDropdown(e) {
      if (e.target === this.$refs.openIndicator || e.target === this.$refs.search || e.target === this.$refs.toggle || e.target === this.$el) {
        if (this.open) {
          this.$refs.search.blur() // dropdown will close on blur
        } else {
          this.open = true
          this.$refs.search.focus()
        }
      }
    },

    /**
     * Check if the given option is currently selected.
     * @param  {Object|String}  option
     * @return {Boolean}        True when selected | False otherwise
     */
    isOptionSelected(option) {
      if (this.multiple && this.mutableValue) {
        let selected = false;
        this.mutableValue.forEach(opt => {
          if (opt[this.label] === option[this.label] || opt[this.label] === option)
            selected = true;
        })
        return selected
      }
      return this.mutableValue === option
    },

    /**
     * If there is any text in the search input, remove it.
     * Otherwise, blur the search input to close the dropdown.
     * @return {void}
     */
    onEscape() {
      if (!this.search.length) {
        this.$refs.search.blur()
      } else {
        this.search = ''
      }
    },

    /**
     * Close the dropdown on blur.
     * @emits  {search:blur}
     * @return {void}
     */
    onSearchBlur() {
      if (this.clearSearchOnBlur) {
        this.search = ''
      }
      this.open = false
      this.$emit('search:blur')
    },

    /**
     * Open the dropdown on focus.
     * @emits  {search:focus}
     * @return {void}
     */
    onSearchFocus() {
      this.open = true
      this.$emit('search:focus')
    },

    /**
     * Delete the value on Delete keypress when there is no
     * text in the search input, & there's tags to delete
     * @return {this.value}
     */
    maybeDeleteValue() {
      if (!this.$refs.search.value.length && this.mutableValue) {
        let data;
        if (this.multiple) {
          data = this.mutableValue.pop();
          if (this.tree) {
            this.$set(data, 'selected', false);
            this.$set(data, 'checked', false);
          }
        } else {
          data = this.mutableValue = null
        }
        return data
      }
    },

    /**
     * Determine if an option exists
     * within this.datas array.
     *
     * @param  {Object || String} option
     * @return {boolean}
     */
    optionExists(text) {
      let exists = false

      this.datas.forEach(opt => {
        if (opt[this.label] === text) {
          exists = true
        }
      })

      return exists
    },

    /**
     * If push-tags is true, push the
     * given option to datas.
     *
     * @param  {Object || String} option
     * @return {void}
     */
    maybePushTag(option) {
      if (this.pushTags) {
        this.datas.push(option)
      }
    }
  },

  computed: {
    /**
     * Classes to be output on .dropdown
     * @return {Object}
     */
    dropdownClasses() {
      return {
        open: this.dropdownOpen,
        single: !this.multiple,
        searching: this.searching,
        searchable: this.searchable,
        unsearchable: !this.searchable,
        loading: this.mutableLoading
      }
    },

    /**
     * If search text should clear on blur
     * @return {Boolean} True when single and clearSearchOnSelect
     */
    clearSearchOnBlur() {
      return this.clearSearchOnSelect && !this.multiple
    },

    /**
     * Return the current state of the
     * search input
     * @return {Boolean} True if non empty value
     */
    searching() {
      return !!this.search
    },

    /**
     * Return the current state of the
     * dropdown menu.
     * @return {Boolean} True if open
     */
    dropdownOpen() {
      return this.noDrop ? false : this.open && !this.mutableLoading
    },

    /**
     * Return the placeholder string if it's set
     * & there is no value selected.
     * @return {String} Placeholder text
     */
    searchPlaceholder() {
      if (this.isValueEmpty && this.placeholder) {
        return this.placeholder;
      }
    },

    /**
     * The currently displayed options, filtered
     * by the search elements value. If tagging
     * true, the search text will be prepended
     * if it doesn't already exist.
     *
     * @return {array}
     */
    filteredOptions() {
      let items = this.datas.filter((option) => {
        return this.onFilter(option);
      })
      if (this.taggable && this.search.length && !this.optionExists(this.search)) {
        console.log("unshift search:", this.search);
        items.unshift(this.search)
      }
      return items
    },

    /**
     * Check if there aren't any options selected.
     * @return {Boolean}
     */
    isValueEmpty() {
      if (this.mutableValue) {
        if (typeof this.mutableValue === 'object') {
          return !Object.keys(this.mutableValue).length
        }
        return !this.mutableValue.length
      }

      return true;
    },

    /**
     * Return the current value in array format.
     * @return {Array}
     */
    valueAsArray() {
      if (this.multiple) {
        return this.mutableValue
      } else if (this.mutableValue) {
        return [this.mutableValue]
      }
      return []
    },
    valueAsString() {
      if (!this.mutableValue || this.mutableValue.length === 0)
        return "";
      if (this.mutableValue.length) {
        let values = [];
        this.mutableValue.forEach(data => {
          values.push(data[this.valueField]);
        });
        return values.join(",");
      }
      return this.mutableValue[this.valueField];
    }
  },

}
</script>
