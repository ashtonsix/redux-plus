'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.api = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * An easy way to create api request in reducers
                                                                                                                                                                                                                                                                   * Superset of promise
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   * api('POST', '/api/endpoint')
                                                                                                                                                                                                                                                                   * api('POST', '/api/endpoint', {headers: {Authentication: 'password'}})
                                                                                                                                                                                                                                                                   * api({method: 'POST', url: '/api/endpoint', headers: {Authentication: 'password'}})
                                                                                                                                                                                                                                                                   * api((state, {payload}) => xr.post('/api/endpoint', payload))
                                                                                                                                                                                                                                                                   * api('POST', '/api/endpoint', (state) => ({counter: state.counter + 1, ...state}))
                                                                                                                                                                                                                                                                   */

var _xr = require('xr');

var _xr2 = _interopRequireDefault(_xr);

var _getModel = require('../getModel');

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var generateRequest = function generateRequest(config) {
  return typeof config === 'function' ? config : function (state, _ref) {
    var payload = _ref.payload;
    return (0, _xr2.default)(_extends(_defineProperty({}, config.method === 'GET' ? 'params' : 'data', payload), config));
  };
};

var _api = function _api(requestConfig) {
  var reducer = arguments.length <= 1 || arguments[1] === undefined ? _getModel.getModel : arguments[1];
  return function (state, action) {
    var generator = function generator() {
      return generateRequest(requestConfig)(state, action).then(function (response) {
        return { type: action.type + '_SUCCESS', payload: response.data, meta: { response: response } };
      }, function (error) {
        return { type: action.type + '_FAILURE', payload: error };
      });
    };
    return (0, _index.createEffect)(reducer(state, action), generator);
  };
};

var api = exports.api = function api() {
  return typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string' && typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'string' ? typeof (arguments.length <= 2 ? undefined : arguments[2]) !== 'function' ? _api(_extends({ method: arguments.length <= 0 ? undefined : arguments[0], url: arguments.length <= 1 ? undefined : arguments[1] }, arguments.length <= 2 ? undefined : arguments[2]), arguments.length <= 3 ? undefined : arguments[3]) : _api({ method: arguments.length <= 0 ? undefined : arguments[0], url: arguments.length <= 1 ? undefined : arguments[1] }, arguments.length <= 2 ? undefined : arguments[2]) : _api.apply(undefined, arguments);
};