'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _RIEBase2 = require('./RIEBase');

var _RIEBase3 = _interopRequireDefault(_RIEBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require('debug')('RIEStatefulBase');

var RIEStatefulBase = function (_RIEBase) {
    _inherits(RIEStatefulBase, _RIEBase);

    function RIEStatefulBase(props) {
        _classCallCheck(this, RIEStatefulBase);

        var _this = _possibleConstructorReturn(this, (RIEStatefulBase.__proto__ || Object.getPrototypeOf(RIEStatefulBase)).call(this, props));

        _this.startEditing = function () {
            debug('startEditing');
            _this.props.beforeStart ? _this.props.beforeStart() : null;
            if (_this.props.isDisabled) return;
            _this.setState({ editing: true });
            _this.props.afterStart ? _this.props.afterStart() : null;
        };

        _this.finishEditing = function () {
            debug('finishEditing');
            _this.props.beforeFinish ? _this.props.beforeFinish() : null;

            var newValue = _reactDom2.default.findDOMNode(_this.refs.input).value;
            var valid = _this.doValidations(newValue);

            if (valid && _this.props.value != newValue) _this.commit(newValue);else if (_this.props.handleValidationFail) _this.props.handleValidationFail(valid, newValue, function () {
                return _this.cancelEditing();
            });else _this.cancelEditing();

            _this.props.afterFinish ? _this.props.afterFinish() : null;
        };

        _this.cancelEditing = function () {
            debug('cancelEditing');
            _this.setState({ editing: false, invalid: false });
        };

        _this.keyDown = function (event) {
            debug('keyDown(' + event.keyCode + ')');
            if (event.keyCode === 13) {
                _this.finishEditing();
            } // Enter
            else if (event.keyCode === 27) {
                    _this.cancelEditing();
                } // Escape
        };

        _this.keyUp = function () {
            debug('keyUp');
            _this.resizeInput(_this.refs.input);
        };

        _this.resizeInput = function (input) {
            if (!input.startW) {
                input.startW = input.offsetWidth;
            }
            var style = input.style;
            style.width = 0; // recalculate from 0, in case characters are deleted
            var desiredW = input.scrollWidth;
            desiredW += input.offsetHeight; // pad to reduce jerkyness when typing
            style.width = Math.max(desiredW, input.startW) + 'px';
        };

        _this.textChanged = function (event) {
            debug('textChanged(' + event.target.value + ')');
            _this.doValidations(event.target.value.trim());
        };

        _this.componentDidUpdate = function (prevProps, prevState) {
            debug('componentDidUpdate(' + prevProps + ', ' + prevState + ')');
            var inputElem = _reactDom2.default.findDOMNode(_this.refs.input);
            debug(inputElem);
            if (_this.state.editing && !prevState.editing) {
                debug('entering edit mode');
                inputElem.focus();
                _this.resizeInput(inputElem);

                if (typeof _this.props.selectAll === 'undefined' || _this.props.selectAll) {
                    _this.selectInputText(inputElem);
                }
            } else if (_this.state.editing && prevProps.text != _this.props.text) {
                debug('not editing && text not equal previous props -- finishing editing');
                _this.finishEditing();
            }
        };

        _this.renderEditingComponent = function () {
            debug('renderEditingComponent()');
            return _react2.default.createElement('input', _extends({
                disabled: _this.state.loading,
                className: _this.makeClassString(),
                defaultValue: _this.props.value,
                onInput: _this.textChanged,
                onBlur: _this.elementBlur,
                ref: 'input',
                onKeyDown: _this.keyDown,
                onKeyUp: _this.keyUp
            }, _this.props.editProps));
        };

        _this.renderNormalComponent = function () {
            debug('renderNormalComponent');
            var editingHandlers = !_this.props.shouldStartEditOnDoubleClick ? {
                onFocus: _this.startEditing,
                onClick: _this.startEditing
            } : {
                onDoubleClick: _this.startEditing
            };
            return _react2.default.createElement(
                'span',
                _extends({
                    tabIndex: '0',
                    className: _this.makeClassString()
                }, editingHandlers, _this.props.defaultProps),
                _this.state.newValue || _this.props.value || _this.getValue()
            );
        };

        _this.elementBlur = function (event) {
            debug('elementBlur(' + event + ')');
            _this.finishEditing();
        };

        _this.elementClick = function (event) {
            debug('elementClick(' + event + ')');
            _this.startEditing();
            if (event.target.element) {
                event.target.element.focus();
            }
        };

        _this.elementDoubleClick = function (event) {
            debug('elementDoubleClick(' + event + ')');
            _this.startEditing();
            if (event.target.element) {
                event.target.element.focus();
            }
        };

        _this.render = function () {
            debug('render()');
            if (_this.state.editing) {
                return _this.renderEditingComponent();
            } else {
                return _this.renderNormalComponent();
            }
        };

        return _this;
    }

    _createClass(RIEStatefulBase, [{
        key: 'componentWillReciveProps',
        value: function componentWillReciveProps(nextProps) {
            if (nextProps.editing && !this.state.editing) {
                this.startEditing();
            }
        }
    }]);

    return RIEStatefulBase;
}(_RIEBase3.default);

exports.default = RIEStatefulBase;