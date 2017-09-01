// es6 polyfill
import 'core-js/fn/array/find-index';

//import Sortable from './utils/Sortable';

//import Cascader from './components/cascader';
import Button from './components/button';
import Checkbox from './components/checkbox';
import Circle from './components/circle';
import Datepicker from './components/datepicker';
import Menu from './components/menu';
// import DatePicker from './components/date-picker';
// import Dropdown from './components/dropdown';
import Icon from './components/icon';
// import Input from './components/input';
import LoadingBar from './components/loading-bar';
import Message from './components/message';
import Modal from './components/modal';
import Notice from './components/notice';
import Poptip from './components/poptip';
// import Progress from './components/progress';
import Radio from './components/radio';
import Rate from './components/rate';
// import Steps from './components/steps';
import Switch from './components/switch';
import Select from './components/select';
// import Tabs from './components/tabs';
// import TimePicker from './components/time-picker';
// import Tooltip from './components/tooltip';
import Tree from './components/tree';
import locale from './locale';
import DataGrid from './components/datagrid';
import UploadImage from './components/upload-image';
import UploadFile from './components/upload-file';

const cui = {
    iButton: Button,
    Button,
    ButtonGroup: Button.Group,
    //Cascader,
    Checkbox,
    CheckboxGroup: Checkbox.Group,
    iCircle: Circle,
    Datepicker,
    datepicker: Datepicker,
    Menu,
    MenuItm: Menu.Item,
    // //Dropdown,
    // //DropdownItem: Dropdown.Item,
    // //DropdownMenu: Dropdown.Menu,
    Icon,
    // //Input,
    // //iInput: Input,
    Modal,
    modal: Modal,
    Notice,
    Poptip,
    // //Progress,
    // //iProgress: Progress,
    Radio,
    RadioGroup: Radio.Group,
    Rate,
    // step: Steps.Step,
    // Steps,
    Select,
    iSelect: Select,
    //Switch,
    iSwitch: Switch,
    // //Tabs,
    // // tabs: Tabs,
    // // TabPane: Tabs.Pane,
    // // tabpane: Tabs.Pane,
    // // TimePicker,
    // // Tooltip,
    Tree,
    DataGrid,
    datagrid: DataGrid,
    UploadImage,
    uploadimage: UploadImage,
    UploadFile,
    uploadfile: UploadFile
};

const install = function(Vue, opts = {}) {
    locale.use(opts.locale);
    locale.i18n(opts.i18n);

    Object.keys(cui).forEach((key) => {
        Vue.component(key, cui[key]);
    });

    Vue.prototype.$Loading = LoadingBar;
    Vue.prototype.$Message = Message;
    Vue.prototype.$Modal = Modal;
    Vue.prototype.$Notice = Notice;
};

// auto install
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

module.exports = Object.assign(cui, { install }); // eslint-disable-line no-undef