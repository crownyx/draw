var passed = 0;
var total = 0;
var reports = [];

window.addEventListener('load', function() {
  var _infopanel = document.getElementById('infopanel');
  var _infopanelTop = document.getElementById('infopanel-top');
  var _infopanelButtons = document.getElementById('infopanel-buttons');
  var _infopanelBottom = document.getElementById('infopanel-bottom');

  assertEqual(_infopanelTop.childNodes.length, 1);
  assertEqual(_infopanelButtons.childNodes.length, 1);
  assertEqual(_infopanelBottom.childNodes.length, 0);

  window.addEventListener('keydown', function(e) {
    if(!e.shiftKey && e.which == charCodes[':']) {
      console.log("%cTEST RESULTS:", "color: blue");
      console.log("%c%i of %s passed.", "color: " + (passed == total ? "green" : "red"), passed, total);
      if(reports.length) {
        console.log("%cFAILED:", "color: blue");
        reports.forEach(function(report) { console.log("%c%s", "color: black", report); });
      }
    }
  }, false);
}, false);

function assertEqual(actualValue, expectedValue, lineno) {
  if(actualValue != expectedValue) {
    var lineno = (function(stack) { return stack[stack.length - 2]; })(new Error('').stack.split(":"));
    reports.push("line " + lineno + " (assertEqual): expected " + expectedValue + ", got " + actualValue);
  } else {
    passed += 1;
  }
  total += 1;
}
