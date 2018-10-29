/**
 * Global Util Functions
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */

const React = require('react');
const striptags = require('striptags');
const {Emoji} = require('emoji-mart');
const {MultiLineParser} = require('text-emoji-parser');
const {isEqual} = require('lodash/isEqual');
const {isObject} = require('lodash/isObject');
const {transform} = require('lodash/transform');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const {beepDataUri} = require('./beepSound');

const UTIL = {
    /**
     * Test if Obj is empty
     */
    objIsEmpty: (obj) => {
        if (typeof obj === 'object' && !(obj instanceof Array)) {
            if (Object.keys(obj).length === 0) return true;
        }
        return false;
    },

    /**
     * Convert Obj to Arr
     */
    objToArr: obj => Object.keys(obj).map(k => obj[k]),

    arrayUnique: (array) => {
        let a = array.concat();
        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    },

    /**
     * Limit characters, placing a ... at the end
     */
    limitChars: (str, limit = 15) => {
        if (str.length > limit) return `${str.substr(0, limit).trim()} ...`;
        return str;
    },

    emojiTextParser: (messageText) => {
        return MultiLineParser(messageText,
            {
                SplitLinesTag: 'span',
                Rule: /(?::[^:]+:(?::skin-tone-(?:\d):)?)/gi
            },
            (Rule, ruleNumber) => {
                return <Emoji emoji={Rule} size={20}/>
            });

    },

    /**
     * Decode HTML Entites
     */
    htmlEntitiesDecode: str => entities.decode(str),

    /**
     * Convert all HTMLEntities when Array
     */
    convertHtmlEntitiesArray: (arr) => {
        const finalArr = arr;

        if (arr instanceof Array) {
            arr.forEach((item, key) => {
                if (item instanceof Array) {
                    finalArr[key] = UTIL.convertHtmlEntitiesArray(item);
                } else if (typeof item === 'object') {
                    finalArr[key] = UTIL.convertHtmlEntitiesObject(item);
                } else if (typeof item === 'string') {
                    finalArr[key] = entities.decode(striptags(item));
                }
            });
        }

        return finalArr;
    },


    copy: (mainObj) => {
        let objCopy = {};
        let key;
        for (key in mainObj) {
            objCopy[key] = mainObj[key];
        }
        return objCopy;
    },


    /**
     * Convert all HTMLEntities when Object
     */
    convertHtmlEntitiesObject: (obj) => {
        const finalObj = obj;

        if (typeof obj === 'object' && !(obj instanceof Array)) {
            Object.keys(obj).forEach((key) => {
                const item = obj[key];

                if (item instanceof Array) {
                    finalObj[key] = UTIL.convertHtmlEntitiesArray(item);
                } else if (typeof item === 'object') {
                    finalObj[key] = UTIL.convertHtmlEntitiesObject(item);
                } else if (typeof item === 'string') {
                    finalObj[key] = entities.decode(striptags(item));
                }
            });
        }

        return finalObj;
    },

    /**
     * Strips all HTML tags
     */
    stripTags: str => striptags(str),

    beepNewMessage: () => {
        return beepDataUri;
    },

    difference : (object, base) => {
        function changes(object, base) {
            return transform(object, function (result, value, key) {
                if (!isEqual(value, base[key])) {
                    result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }

        return changes(object, base);
    }
};

/* Export ==================================================================== */
module.exports = UTIL;
module.exports.details = {
    title: 'UTIL',
};
