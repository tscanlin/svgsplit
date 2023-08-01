/* Scripts */

$(document).ready(function() {

  function readfiles(files) {
    var formData = tests.formdata ? new FormData() : null;
    for (var i = 0; i < files.length; i++) {
      if (tests.formdata) {
        formData.append('file', files[i]);
      }

      parseFile(files[i]);
    }
  }

  // This is where the magic happens.
  function parseFile(file) {
    if (tests.filereader === true && acceptedTypes[file.type] === true) {
      var reader = new FileReader();

      reader.onload = function(event) {
        holder.innerHTML = event.target.result;

        var svgNode = $(holder).find("svg"),
        result = event.target.result,
        items = [],
        svgTag = result.match('<svg[^>]*>'),
        svgHead = svgTag[0],
        svgFoot = "</svg>";

        while (svgNode.children().length < 2) {
          svgNode = svgNode.children();
        }

        let styleLookup = {};
        for (var i = 0, length = svgNode.children().length; i < length; i++) {
          var node = svgNode.children().eq(i)[0],
            id = svgNode.children().eq(i).removeAttr("display").attr("id") || i,
            nodeText = serializer.serializeToString(node),
            nodeName = node.nodeName;

          if (nodeName === 'style') {
            // Store styles in dictionary
            let styles = node.innerHTML;
            let styleClasses = styles.split('}');
            styleClasses.forEach(function (styleClass) {
              let matches = /\.(.*?)({.*)/.exec(styleClass.trim());
              if (matches) {
                let className = matches[1];
                let styleRules = matches[2] + '}';
                styleLookup[className] = styleRules;
              }
            });
          } else {
            let classes = [];
            let classList = getAllMatches(node.innerHTML, /class="([^"]+)"/g);
            classList.forEach(function (styleListItem) {
              classes = classes.concat(styleListItem.split(' '));
            });
            var uniqueClasses = onlyUnique(classes);
            var nodeStyles = '';
            if (uniqueClasses.length) {
              nodeStyles = '<style type="text/css">';
              uniqueClasses.forEach(function (uniqueClass) {
                nodeStyles += '.' + uniqueClass + styleLookup[uniqueClass];
              });
              nodeStyles += '</style>';
            }
            nodeText = svgHead + nodeStyles + nodeText + svgFoot;
            zip.file(id + ".svg", nodeText);

            // Add file previews below if enable-preview is checked.
            if ($('#enable-preview').is(':checked')) {
              items[i] = "<div>" + nodeText + "</div>";
              $("#split-svgs").append(items[i]);
            }
          }
        }

        // Handle more than 300 files.
        const len = Object.keys(zip.files)
        let newZip = []
        let index = -1
        len.forEach((k, i) => {
          if (i % 300 == 0) {
            newZip.push(new JSZip())
            index++
          }
          newZip[index].file(k, zip.files[k].asText())
        })

        newZip.forEach((z, i) => {
          console.log(i)
          location.href = `data:application/zip;base64,${z.generate()}`
        })
      };

      reader.readAsText(file);

    } else {
      holder.innerHTML += '<p>Uploaded ' + file.name + ' ' + (file.size ? (file.size / 1024 | 0) + 'K' : '');
    }
  }

  var holder = document.getElementById('holder'),
      serializer = new XMLSerializer(),
      zip = new JSZip(),
      fileArray = [],
      tests = {
      filereader : typeof FileReader != 'undefined',
      dnd : 'draggable' in document.createElement('span'),
      formdata : !!window.FormData,
      progress : "upload" in new XMLHttpRequest()
  }, support = {
      filereader : document.getElementById('filereader'),
      formdata : document.getElementById('formdata'),
      progress : document.getElementById('progress')
  }, acceptedTypes = {
      'image/svg+xml' : true,
      'image/png' : true,
      'image/jpeg' : true,
      'image/gif' : true
  }, progress = document.getElementById('uploadprogress'), fileupload = document.getElementById('upload');

  "filereader formdata progress".split(' ').forEach(function(api) {
      if (tests[api] === false) {
        support[api].className = 'fail';
      } else {
        support[api].className = 'hidden';
      }
  });

  if (tests.dnd) {
    holder.ondragover = function() {
      this.className = 'hover';
      return false;
    };
    holder.ondragend = function() {
      this.className = '';
      return false;
    };
    holder.ondrop = function(e) {
      this.className = '';
      e.preventDefault();
      readfiles(e.dataTransfer.files);
    };
  } else {
    fileupload.className = 'hidden';
    fileupload.querySelector('input').onchange = function() {
      readfiles(this.files);
    };
  }
});

function onlyUnique(arr) {
  var unique = function (value, index, self) {
    return self.indexOf(value) === index;
  }
  return arr.filter(unique);
}

function getAllMatches(str, regex) {
  var matches;
  var list = [];

  do {
    matches = regex.exec(str);
    if (matches) {
      list.push(matches[1]);
    }
  } while (matches);
  return list;
}
