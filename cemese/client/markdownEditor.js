(function () {
  "use strict";

  var MarkdownEditor = function ($el) {
    var $editor = $el.find(".markdown-input-editor textarea");
    var $preview = $el.find(".markdown-input-preview");

    var languageOverrides = {
      js: 'javascript',
      html: 'xml'
    };

    marked.setOptions({
      highlight: function (code, lang) {
        if (languageOverrides[lang]) lang = languageOverrides[lang];
        return hljs.LANGUAGES[lang] ? hljs.highlight(lang, code).value : code;
      }
    });

    function update (e) {
      var val = e.getValue();
      setOutput(val);
    }

    function setOutput (val) {
      val = val.replace(/<equation>((.*?\n)*?.*?)<\/equation>/ig, function (a, b) {
        return '<img src="http://latex.codecogs.com/png.latex?' + encodeURIComponent(b) + '" />';
      });
      $preview.html(marked(val));
    }

    var editor = CodeMirror.fromTextArea($editor[0], {
      mode: 'gfm',
      lineNumbers: true,
      matchBrackets: false,
      lineWrapping: true,
      theme: 'default'
    });
    editor.on("change", update);

    setOutput($editor.val());

    document.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var theFile = e.dataTransfer.files[0];
      var theReader = new FileReader();
      theReader.onload = function (e) {
        editor.setValue(e.target.result);
      };

      theReader.readAsText(theFile);
    }, false);
  }

  $(".markdown-input").each(function () {
    new MarkdownEditor($(this));
  });

}());