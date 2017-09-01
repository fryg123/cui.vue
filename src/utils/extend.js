Date.prototype.toFormat = function (_format) {
    if (!_format)
        _format = 'yyyy/MM/dd HH:mm:ss';
    let year = this.getFullYear();
    let month = parseInt(this.getMonth() + 1, 10);
    let day = this.getDate();
    let hour = this.getHours() > 9 ? this.getHours() : '0' + this.getHours();
    let minute = this.getMinutes() > 9 ? this.getMinutes() : '0' + this.getMinutes();
    let second = this.getSeconds() > 9 ? this.getSeconds() : '0' + this.getSeconds();
    return _format.replace(/yyyy/g, year).replace(/MM/g, month).replace(/dd/g, day).replace(/HH/g, hour).replace(/mm/g, minute).replace(/ss/g, second);
};
String.prototype.startWith = function (charstring) {
    return this.indexOf(charstring) == 0;
};
Array.prototype.insertAt = function (index, item) {
    this.splice(index, 0, item);
};
Array.prototype.remove = function (item) {
    var index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
    return (index > -1);
};
Array.prototype.removeAt = function (index) {
    return this.splice(index, 1);
};
Array.prototype.exists = function (item) {
    return (this.indexOf(item) != -1);
};
Array.prototype.clear = function () {
    this.length = 0;
};
Array.prototype.insertAt = function (index, item) {
    this.splice(index, 0, item);
};
