/******************************************************************************/
/*  Web Behaviour Monitoring Tool - wbm.js                                    */
/*                                                                            */
/*  This script catches mouse and keyboard events and gathers the following   */
/*  data for behaviour monitoring:                                            */
/*  - Houvered object id                                                      */
/*  - mouse position                                                          */
/*  - keyboard key                                                            */
/*  - Ctrl,Alt and Shift                                                      */
/*  - Timestamp                                                               */
/*                                                                            */  
/*  The data is then sent to the server via Ajax.                             */
/*                                                                            */
/*  @author Hugo Gamboa <h.gamboa@fct.unl.pt>                                 */
/*  @contributor Ricardo Tonet <ribeiro.tonet@gmail.com>                      */
/*  @contributor Catia Cepeda <catiamcepeda@gmail.com>                        */
/******************************************************************************/

(function() {

/**********************************************/
/* Variables                                  */

  var starting            = true,  // Boolean flag to control if it is initializing
      connected           = false, // Boolean flag to check if there is a server 
                                   // connection
      logging             = false; // Boolean flag to control console logging

  var commentsBuffer      = new Array(), // Buffer to store comments before 
                                         // connection is established
      eventsBuffer        = new Array(), // Buffer to store events before 
                                         // connection is established
      dataBuffer          = new Array(), // Buffer to store events data and send
                                         // by batches
      dataBufferSize      = 100,
      data                = "";

  var counter             = 0; // Counts all events
  var wbm_version         = 1.0; // Script version

/**********************************************/
/* Functions                                  */

  /**
   * Returns current timestamp.
   * @return {Long} Timestamp.
   */
  function getTimeStamp()
  {
    var now = new Date();
    return now.getTime();
  }

  /**
   * Gets the mouse button code that has been clicked
   * @param  {Event} e  Mouse Event
   * @return {String}   Mouse button clicked
   */
  function button(e)
  {
    var str;
    if (navigator.appName.indexOf("Microsoft") != -1) {
      if (e.button == 0) {
        // It was -10. this is only for the MSIE. It does not catch all 
        // the mouse keys events, as the click and the double click, 
        // for the right and center keys.
        str = 1;
      } else if (e.button == 1) {
        str = 1;
      } else if (e.button == 2) {
        str = 2;
      } else if (e.button == 4) {
        str = 3;
      }
    } else {
      str = e.which;
    }
    return str;
  }

  /**
   * Returns the mouse position on the page, taking into consideration the scroll.
   * @param  {Event} e  Mouse Event
   * @return {String}   Mouse Positions X and Y
   */
  function getMousePosition(e)
  {
    // In case we want to control the scrolling
    var _x = e.clientX + document.body.scrollLeft;
    var _y = e.clientY + document.body.scrollTop;
    var str = e.clientX + "\t" + e.clientY + "\t" + _x + "\t" + _y + "\t";

    return str;
  }

  /**
   * Find the current node id or recursively find the parent's.
   * @param  {Event} event Mouse or Keyboard event
   * @return {Mixed}       Node ID
   */
  function getNodeid(event) 
  {
    if (event.id) { 
      return event.id; 
    } else { 
      if (event.parentNode) {
        return getNodeid(event.parentNode);
      } else {
        return -1;
      }
    }
  }

  /**
   * Return the element id.
   * @param  {Event} e Mouse or Keyboard event
   * @return {String}  Element ID
   */
  function getIDObject(e) 
  {
    var str = "-1";

    if (e.target) {
      str = getNodeid(e['target'])+"\t";
    } else if (e.srcElement) {
      str = getNodeid(e['srcElement'])+"\t";
    }
      
    return str;
  }

  /**
   * Return keyboard key pressed.
   * @param  {Event} e Keyboard event
   * @return {String}  Key code
   */
  function getKey(e)
  {
    var key = "";

    if (!e) {
      e = window.event;
    }
    if (e.keyCode) {
      key = e.keyCode;
    } else {
      key = 0;
    }

    return key+"\t";
  }

  /**
   * Return the state of Ctrl, Shift and Alt keys during mouse and keyboard events.
   * @param  {Event} e Mouse and Keyboard events
   * @return {String}  String with the key states 0/1.
   */
  function getCtrlShiftAlt(e)
  {
    var alt   = 0,
        shift = 0,
        ctrl  = 0;

    if (e.altKey) {
      alt = 1;
    } 
    if (e.shiftKey) {
      shift = 1;
    } 
    if (e.ctrlKey) {
      ctrl = 1;
    }

    return shift+"\t"+alt+"\t"+ctrl+"\t";
  }

  /**
   * Build final data string and send it via Ajax.
   * @param  {Event} e Mouse and Keyboard event
   * @return {Void}
   */
  function makeString(e) 
  {
    var str = "";

    if (!e) {
      e = window.event;
    }
    
    switch(e.type) {
      case ("mousemove"):
        str = "0";
        break;
      case ("mousedown"):
        str = button(e)//+"";
        break;
      case ("mouseup"):
        str = button(e)+3;
        // str = val+""; 
        break;
      case ("click"):
        str = button(e)+6;
        // str = val+"";
        break;
      case ("dblclick"):
        str = button(e)+9;
        // str = val+""; 
        break;
      case ("keydown"):
        str = "13";
        break;
      case ("keyup"):
        str = "14";
        break;
      default:
        str = "20";
        break;
    }

    str = counter + "\t" + str + "\t" + getIDObject(e) + getMousePosition(e); 
    str += getKey(e) + getCtrlShiftAlt(e) + getTimeStamp() + "\n";
    counter += 1;

    // If there's no connection but the acquisition has started, store the data 
    // into a buffer.
    if (!connected && starting) {
      eventsBuffer.push(str);
    }
    
    if (connected) {
      // If there was data stored on the buffer before connection, send it now.
      if (eventsBuffer.length != 0) {
        for (var i = 0; i < eventsBuffer.length; i++) {
          sendData(eventsBuffer[i]);
        }
        eventsBuffer = new Array();
      }

      // Add data acquired to a buffer, to send by batches as opposed to on every
      // event.
      dataBuffer.push(str);

      // Send the data when the buffer is full.
      if (dataBuffer.length >= dataBufferSize) {
        for (var i = 0; i < dataBufferSize; i++) {
          sendData(dataBuffer.shift());
        }
      }
    }
  }

  /**
   * Returns a string to add to the file naming convention. Edit this function if you
   * need extra data on the file name for correct acquisition identification.
   * @return {String}
   */
  function fileIdString()
  {
    var str = '';

    // Add your code here
     
    return (str === '') ? str : '_'+str;
  }

  /**
   * Send data to server via XHTMLHttpRequest.
   * @param  {String} s Data string
   * @return {Void}
   */
  function sendData(s) 
  {
    var host = document.location.hostname.replace(/\./g,'-').toLowerCase(),
        path = document.location.pathname.replace(/\//g,'-').toLowerCase().replace('-','');

    var f = host + '_' + path + fileIdString();

    if (logging) {
      console.log(f);
      console.log('Data:');
      console.log(s);
    }

    // Send data via ajax POST
    var http = new XMLHttpRequest();
    var url = '/wbm/wbm.php';
    
    http.open("POST", url);
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    http.onreadystatechange = function() {
      if (http.readyState == XMLHttpRequest.DONE && logging) {
        console.log("r:")
        console.log(r);
      }
    }
    http.send( "json="+(JSON.stringify({'file': f,'data': s})) );   
  }

  /**
   * Send comment to server.    
   * @param  {String} s Comment string
   * @return {Void}
   */
  function sendComment(s) 
  {
    s = '#' + getTimeStamp() + "\t" + s + "\n";
    
    // If there's no connection but the acquisition has started, store the data 
    // into a buffer.
    if (!connected && starting) {
      commentsBuffer.push(s);
    }
    
    if (connected) {
      // If there was data stored on the buffer before connection, send it now.
      if (commentsBuffer.length != 0) {
        for (var i=0; i<commentsBuffer.length; i++) {
          sendData(commentsBuffer[i]);
        }
        commentsBuffer = new Array();
      }
      sendData(s);
    }
  }

  /**
   * Get the value of query variable from URL.
   * Ref: http://www.phpied.com/javascript-include/
   * @param  {String} variable Query variable name
   * @return {String}          Query variable value
   */
  function getQueryVariable(variable) 
  {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
    }
    if (logging) {
      console.log('Query variable %s not found', variable);
    }
  }

  /**
   * Convert an object to a string representation.
   * @param  {Object} obj Object to convert
   * @return {String}     String conversion of object
   */ 
  function obj2string(obj) 
  {
    var output = "";
    for (property in obj) {
      if ((typeof(obj[property]) == 'number') || 
        (typeof(obj[property]) == 'string')) {
        output += property + ': ' + obj[property]+'; ';
      }    
    }      
    return output;
  }

  /**
   * Set the mouse and keyboard event listeners.
   * @return {Void}
   */
  function CaptureEvents()
  {
    if (window.addEventListener) {
      document.addEventListener("mousemove", makeString, false);
      document.addEventListener("mousedown", makeString, false);
      document.addEventListener("mouseup", makeString, false);
      document.addEventListener("mouseclick", makeString, false);
      document.addEventListener("mousedblclik", makeString,false);
      document.addEventListener("keydown", makeString, false);
      document.addEventListener("keyup", makeString, false);
    }
    if (window.attachEvent) {
      document.attachEvent("onmousemove", makeString);
      document.attachEvent("onmousedown", makeString);
      document.attachEvent("onmouseup", makeString);
      document.attachEvent("onmouseclick", makeString);
      document.attachEvent("onmousedblclik", makeString);
      document.attachEvent("onkeydown", makeString);
      document.attachEvent("onkeyup", makeString);
    }
  }

  /**
   * Checks the communication with the server.
   * @param  {String} str Page info
   * @return {Boolean}    State of connection
   */
  function ajax_begin(str) 
  {
    if (logging) {
        console.log('Begin: ')
        console.log(str)
    }
    // TODO: START AJAX COMMUNICATION
    return true;
  }

  /**
   * Sets up the event listeners and checks for server communications.
   * @param  {String} name Query variable 'name' value
   * @param  {String} id   Query variable 'id' value
   * @param  {String} page Query variable 'page' value
   * @return {Void}
   */
  function initParams(name,id,page)
  {
    CaptureEvents();

    if (starting) { 
      starting = false;
      connected = ajax_begin(name+"-"+id+"-"+page);

      if (!connected) {
        alert("No connection with the server\n The page will not be monitored.");
      }
      // If there was data stored on the buffer before connection, send it now.
      if (commentsBuffer.length != 0) {
        for (var i=0; i < commentsBuffer.length; i++) {
          sendData(commentsBuffer[i]);
        }
        commentsBuffer = new Array();
      }
    }
  }

  /**
   * Init the acquisition system.
   * @return {Void}
   */
  function init() 
  {
    var name = getQueryVariable("name"),
        page = getQueryVariable("page"),
        id   = getQueryVariable("id");
    
    initParams(name,id,page);

    sendComment('WBM Version: ' + wbm_version);
    sendComment(obj2string(window.screen));
    sendComment(obj2string(window.navigator));
  }
  
  /**
   * Attach the initializion function to the onload event. 
   * @param {Function} func Function handler
   */
  function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
      window.onload = func;
    } else {
      window.onload = function() {
        func();
        oldonload();
      }
    }
  }

  // Initialize the system
  addLoadEvent(init);

})();