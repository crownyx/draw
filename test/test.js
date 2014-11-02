var tests = [];

var testcanvas = new Canvas('test');

window.addEventListener('load', function() {
  testcanvas.canvas.width   = window.innerWidth  - 202;
  testcanvas.canvas.height  = window.innerHeight - 10;
  testcanvas.context.fillStyle = "red";

  var _infopanelTop = document.getElementById('infopanel-top');
  var _infopanelButtons = document.getElementById('infopanel-buttons').childNodes;
  var _infopanelBottom = document.getElementById('infopanel-bottom');

  tests.push(
    assertEqual(function() { return _infopanelTop.childNodes.length;                }, 1),
    assertEqual(function() { return _infopanelTop.childNodes[0].textContent;        }, "click on canvas to begin drawing"),
    assertEqual(function() { return _infopanelButtons.length;                       }, 1),
    assertEqual(function() { return _infopanelButtons[0].childNodes.length;         }, 2),
    assertEqual(function() { return _infopanelButtons[0].childNodes[0].textContent; }, "g"),
    assertEqual(function() { return _infopanelButtons[0].childNodes[1].textContent; }, "choose point"),
    assertEqual(function() { return _infopanelBottom.childNodes.length              }, 0),

    confirmCorrect(function() { setPoint("200,200"); }),

    assertEqual(function() { return _infopanelTop.childNodes.length;                }, 1),
    assertEqual(function() { return _infopanelTop.childNodes[0].textContent;        }, "click on canvas to begin drawing"),
    assertEqual(function() { return _infopanelButtons.length;                       }, 1),
    assertEqual(function() { return _infopanelButtons[0].childNodes.length;         }, 2),
    assertEqual(function() { return _infopanelButtons[0].childNodes[0].textContent; }, "g"),
    assertEqual(function() { return _infopanelButtons[0].childNodes[1].textContent; }, "choose point"),
    assertEqual(function() { return _infopanelBottom.childNodes.length              }, 1),

    compareImageData(function() { setPoint(null);      }),
    compareImageData(function() { setPoint(null);      }),
    compareImageData(function() { setPoint("");        }),
    compareImageData(function() { setPoint(undefined); }),
    compareImageData(function() { setPoint(0);         }),
    compareImageData(function() { setPoint(23);        }),
    compareImageData(function() { setPoint("23");      }),
    compareImageData(function() { setPoint(",23");     }),
    compareImageData(function() { setPoint("23,");     }),
    compareImageData(function() { setPoint("400,400"); }, false),

    confirmCorrect(function() { setPoint("300,300"); }),

    assertEqual(function() { return _infopanelBottom.childNodes.length; }, 1),

    confirmCorrect(function() { setPoint("x"); }),
    assertEqual(function() { return _infopanelBottom.childNodes.length; }, 0),

    compareImageData(function() { setPoint(null);      }),
    compareImageData(function() { setPoint("");        }),
    compareImageData(function() { setPoint(undefined); }),
    compareImageData(function() { setPoint(0);         }),
    compareImageData(function() { setPoint(23);        }),
    compareImageData(function() { setPoint("23");      }),
    compareImageData(function() { setPoint(",23");     }),
    compareImageData(function() { setPoint("23,");     })
  );

  tests.push(
    assertEqual(function() { return _infopanelTop.childNodes.length; }, 1),
    assertEqual(function() { return _infopanelTop.childNodes[0].childNodes.length; }, 3)
  );

  console.log(runTests());
}, false);

var failed = [];
var total = 0;
var reports = [];

//////////////
// runTests //
//////////////

function runTests() {
  delete window.y; delete window.n;
  testcanvas.clear();
  var nextUp = tests.findIndex(function(test) {
    test.run();
    window.lastRun = test.run;
    total += 1;
    if(test.assert) {
      if(!test.result) failed.push(test);
      return false;
    } else {
      return true;
    }
  });
  if(nextUp == -1) {
    var passed = total - failed.length;
    if(failed.length) {
      console.log("%cFAILED:", "color: blue");
      failed.forEach(function(failedTest) { console.log("%c%s", "color: black", failedTest.failReport()); });
    }
    return passed + " of " + total + " passed";
  } else {
    var lastTest = tests[nextUp];
    tests = tests.slice(nextUp + 1);
    Object.defineProperty(window, 'y', {
      get: function() {
        lastTest.assert = true;
        lastTest.result = true;
        return runTests();
      },
      configurable: true
    });
    testcanvas.context.fillText(
      lastTest.run.toString().replace(/[^{]+/, '').slice(2, -3), 10, testcanvas.canvas.height - 15
    );
    return "good? y/n";
  }
}

//////////////////////
// compareImageData //
//////////////////////

function compareImageData(setUp, expectToPass = true) {
  return {
    assert: true,
    run: function() {
      var compareData = front.context.getImageData(0, 0, front.canvas.width, front.canvas.height).data;
      setUp();
      var allSame = true;
      var imageData = front.context.getImageData(0, 0, front.canvas.width, front.canvas.height).data;
      for(var i = 0; i < imageData.length; i++) {
        if(imageData[i] != compareData[i]) {
          allSame = false;
          break;
        }
      }
      this.result = expectToPass ? allSame : !allSame;
    },
    failReport: function() { return setUp.toString().replace(/[^{]+/, '').slice(2,-3); }
  }
}

/////////////////
// assertEqual //
/////////////////

function assertEqual(actualValue, expectedValue) {
  return {
    assert: true,
    run: function() {
      this.result = actualValue() == expectedValue;
    },
    failReport: function() {
      var stack = new Error('').stack.split(":");
      var lineno = stack[stack.length - 2];
      var message = "expected " + expectedValue + ", got " + actualValue();
      return "line " + lineno + " (assertEqual): " + message;
    }
  };
}

////////////////////
// confirmCorrect //
////////////////////

function confirmCorrect(setUp) {
  return {
    run: setUp
  };
}
