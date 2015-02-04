# [SVGsplit](http://svgsplit.com)

SVGsplit is a tool for splitting an SVG file into more / smaller files. It takes
the svg groups in a file (```<g> tags```) and makes each group into its own file.
Tools like Adobe Illustrator and Inkscape save each layer as a separate group,
so if you are making icons and have an Illustrator file with a different icon
on each layer, you can save the file as a .svg file and use this tool to make
each layer into its own .svg file.

This tool is available at: [http://svgsplit.com](http://svgsplit.com)

## Limitations

This won't work well if each layer has different sizes since <g> tags don't have
a way to specify a size, so every layer should be the same size. However, with
most applications this shouldn't be an issue. Open an issue if you find any
issues or have a specific use case other than the intended in mind.

## License

This tool is MIT licensed so feel free to do whatever you want with it.
