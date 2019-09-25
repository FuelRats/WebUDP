export default [{
  input: 'src/webudp.node.js',
  output: [{
    file: 'dist/webudp-node.js',
    format: 'cjs'
  }, {
    file: 'dist/webudp-node.mjs',
    format: 'esm'
  }],
  external: [ 'wrtc' ]
}, {
  input: 'src/webudp.browser.js',
  output: [
    {
      file: 'dist/webudp-browser.js',
      format: 'cjs'
    },
    {
      file: 'dist/webudp-browser.mjs',
      format: 'esm'
    }
  ],
  external: [ 'wrtc' ]
}]
