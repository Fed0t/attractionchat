module.exports = api => {
    api.cache(false);
    return {
        presets: [ "@babel/preset-react","@babel/preset-env"],
        plugins:  ["transform-class-properties", "transform-regenerator","@babel/plugin-proposal-object-rest-spread"]
    }
}