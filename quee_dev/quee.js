/**
 * @file A HTML5 canvas wrapper designed for light and easy 2d game making or graphical animation. It uses callbacks when a pre-defined event occurs. <br><br> <a href="/">quee.js home</a> <br><br> <strong>This documentation is a work-in-progress.</strong>
 * @author Jack Neils
 * @version 0.7
 * @example <caption>Starting quee.js code:</caption>
 * var world = quee_ui.World() // Makes a world object
 * 
 * quee_image.LoadImages({ // Loads any amount of images
 *   "image1" : "url/to/image1", // Url to image1
 *   "image2" : "url/to/image2"  // Url to image2
 * }, mainloop) // When done, run mainloop()
 * 
 * function mainloop() {
 *  // Put your code in here
 * }
 */

/**
 * quee.js private utility data
 * @type {Object}
 * @protected
 */
const __q__ = {
  dbg: {
    "cbox":false,
    "commands_enabled":true
  },

  globalSprites: [],

  globalImages: [],

  globalCallbacks: {"key":{},"mouse_move":(function(){}),"mouse_click":(function(){})},
  
  keyCallback: function(e)  {// Defign the function that handles keypresses
    locale["quee"]["last_pressed_key"] = e.key;
    locale["quee"]["key_pressed"] = true;
    if (e.key in __q__.globalCallbacks["key"]) {
      __q__.globalCallbacks["key"][e.key](e.key);
    }
    if ("~~" in __q__.globalCallbacks["key"]) {
      __q__.globalCallbacks["key"]["~~"](e.key);
    }
    if ("~-" in __q__.globalCallbacks["key"]) {
      if (e.key in [1,2,3,4,5,6,7,8,9,0]) { // If key in numbers
        __q__.globalCallbacks["key"]["~-"](e.key);
      }
    }
  },

  removeSprites: function(element) {
    var removeIndex = __q__.globalSprites.map(function(item) { return item; }).indexOf(element)
    __q__.globalSprites.splice(removeIndex, 1);
  },

  onMove: function(e) {
    var element = document.getElementById("quee_canvas");
    var offsetX = 0, offsetY = 0;
    
    if (element.offsetParent) { // Calculate the mouse offset
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }
    
    var x = e.pageX - offsetX; // Set the mouse offset
    var y = e.pageY - offsetY;
    
    locale["quee"]["mouse_position"] = [x, y]; // Set mouse position
    
    __q__.globalCallbacks["mouse_move"](x, y); // Call callback for mouse_move
  },

  onClick(e) {
    var element = document.getElementById("quee_canvas");
    var offsetX = 0, offsetY = 0;
    
    if (element.offsetParent) { // Calculate the mouse offset
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }
    
    var x = e.pageX - offsetX; // Set the mouse offset
    var y = e.pageY - offsetY;
    
    __q__.globalCallbacks["mouse_click"](x, y); // Run the mouse click callback
    
    locale["quee"]["mouse_clicked"] = false;
    locale["quee"]["last_mouse_click"] = [x, y] // Set the last mouse click x and y

    var callbacks = []
    
    for (spritenum in __q__.globalSprites) { // list through all sprites
      sprite = __q__.globalSprites[spritenum];
      if (sprite.__world.hidden == false) {
        const [x1, y1, w1, h1] = __q__.getDims(sprite);
        const [x2, y2, w2, h2] = [x, y, 1, 1]; // make a 1x1 square where the mouse was     clicked
        if (sprite["click"]) {
          if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {}
          else {callbacks.push([sprite.__onclick_callback, x, y])} // que the callback function to be run after loop
        }
      }
    }

    for (spritecallback in callbacks) {
      callbacks[spritecallback][0](callbacks[spritecallback][1], callbacks[spritecallback][2])
    }
  },

  // Collision detection
  getDims: function(sprite) {
    var h = sprite.image.height * sprite["scale"]; // Scale the height of the sprite
    var w = (sprite.image.width * sprite["scale"]) * sprite.image.height / sprite.image.width; // Scale the width of the sprite based on the height so to maintain the aspect ratio
    return [sprite["x"], sprite["y"], w, h];
  },

  collided: function(sprite1, sprite2) {
    const [x1, y1, w1, h1] = __q__.getDims(sprite1);
    const [x2, y2, w2, h2] = __q__.getDims(sprite2);

    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){ // Calculate if sprite1 is inside of sprite2
      return false;
    }
    return true;
  },

  ifCollision: function(allsprites) {
    var collisions = [];
    for (sprite in allsprites) {
      if (allsprites[sprite]["__type"] == "sprite" && allsprites[sprite].__world.hidden == false) {// Make sure to check if only if they are a sprite and they are NOT hidden
        if (allsprites[sprite]["clip"] == false) {continue} // Do not check if set to     noclip
        for (osprites in allsprites) {
          if (allsprites[osprites]["__type"] == "sprite") { // Make sure to check if only if they are a sprite
            if (osprites == sprite) {break}
            else if (allsprites[osprites]["clip"] == false) {}  // Do not check if set to noclip
            else {
              if (__q__.collided(allsprites[sprite], allsprites[osprites])) {
                collisions.push([allsprites[sprite], allsprites[osprites]]) // Add the sprites to the collisions menu
              }
            }
          }
        }
      }
    }
    return collisions
  }
}

/** 
 * quee.js public variable that may contain useful information, it can also be used as the main dictionary variable for your application.
 * @constant
 * @type {Object}
 * @property {Object}  quee                    - The quee.js specific variables.
 * @property {Object}  quee.last_mouse_click   - The [x, y] of the last mouse click
 * @property {string}  quee.last_pressed_key   - The last pressed key
 * @property {Object}  quee.mouse_position     - The [x, y] of the last place the mouse was
 * @property {bool}    quee.mouse_clicked      - If the mouse is currently held down
 * @property {bool}    quee.key_pressed        - If a key is currently pressed down
 * 
*/ 
var locale = {"quee":{"last_mouse_click":[],"last_pressed_key":"","mouse_position":[],"mouse_clicked":false,"key_pressed":false}};
/** 
 * quee.js public version
 * @constant
 * @type {string}
*/
var VERSION = "0.7";
console.log("using quee.js version: " + VERSION) // Print the startup message

// Set main utility data
document.onkeydown = __q__.keyCallback;
document.onkeyup = (function(){locale["quee"]["key_pressed"] = false});

document.getElementById("quee_canvas").addEventListener("mouseup", __q__.onClick, false);
document.getElementById("quee_canvas").addEventListener("mousedown", (function() {locale["quee"]["mouse_clicked"] = true}), false);
document.getElementById("quee_canvas").addEventListener("mousemove", __q__.onMove, false);

/**
 * @namespace quee_window
 */
const quee_window = {
  /**
   * A shorthand way to use the console.
   * @namespace quee_window.Console
   */
  Console: {
    /**
     * Prints a error to the console
     * @function
     * @param {string} content - Text to use as the error text
     * @example
     * quee_window.Console.Error("Error foo!") // Raises an quee.js error with the text of: "Error foo!" in the console
     */
    Error: function(content) {
      console.error("[quee.js error] " + content);
    },
    /**
     * Prints a warning to the console
     * @function
     * @param {string} content - Text to use as the warning text
     * @example
     * quee_window.Console.Warning("Warning foo!") // Raises an quee.js warning with the text of: "Error foo!" in the console
     */
    Warning: function(content) {
      console.warn("[quee.js warning] " + content)
    },
    /**
     * Prints text to the console
     * @function
     * @param {string} content - Text to print out
     * @example
     * quee_window.Console.Info("Info foo!") // Prints out "Info foo!" to the console
     */
    Info: function(content) {
      console.info("[quee.js info] " + content)
    }
  },
  /**
   * An easy way to set and get simple cookies.
   * @namespace quee_window.Cookies
   */
  Cookies: {
    /**
     * Sets a cookie, if the cookie is already there, it overwrites it.
     * @function
     * @param {string} cname - Name of the cookie
     * @param {string} cvalue - The value of the cookie
     * @example
     * quee_window.Cookies.SetCookie("foo", "bar") // Sets a cookie with the name of "foo" to the value of "bar"
     */
    SetCookie: function(cname, cvalue) {
      document.cookie = cname + "=" + cvalue + ";"
    },
    /**
     * Gets a cookie. If the cookie does not exist, it will return a blank string.
     * @param {string} cname - Name of the cookie
     * @returns {string} The value of the cookie
     * @example
     * quee_window.Cookies.SetCookie("foo", "bar")
     * var cookie = quee_window.Cookie.GetCookie("foo") // Get the cookie with name of "foo"
     * console.log("Foo is: " + cookie)
     * // Console: Foo is: bar
     */
    GetCookie: function(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie); // Decode the cookie
      var ca = decodedCookie.split(';'); // Seperate url string
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
  },
  /**
   * Sets the title of the page
   * @function Title
   * @memberof quee_window
   * @param {string} new_title - Name of the new title
   * @example
   * quee_window.Title("New title!") // Sets the title of the page to "New title!"
   */
  Title: function(new_title) {
    document.title = new_title;
  },
  /**
   * Sets the size of the canvas, if no values provided, will defult to fullscreen
   * @function Canvas
   * @memberof quee_window
   * @param {int} width - Width of the canvas
   * @param {int} height - Height of the canvas
   * @example
   * quee_window.Canvas(width=10) // Sets the width to 10
   * quee_window.Canvas(height=10) // Sets the height to 10
   * 
   * quee_window.Canvas() // Fullscreen the canvas element
   */
  Canvas: function(width=null, height=null) {
    // Resise the canvas
    if (width != null && height != null) {
      document.getElementById("quee_canvas").width = width
      document.getElementById("quee_canvas").width = height
    }
    else if (width != null && height == null) {
      document.getElementById("quee_canvas").width = width
    }
    else if (width == null && height != null) {
      document.getElementById("quee_canvas").height = height
    }
    else {
      document.getElementById("quee_canvas").width = window.innerWidth; 
      document.getElementById("quee_canvas").height = window.innerHeight;
    }
  },
  /**
   * An easy way to make a stopwatch.
   * @namespace quee_window.Stopwatch
   */
  Stopwatch: {
    /**
     * Creates a new timer object
     * @constructor
     * @property {bool} paused - If the stopwatch is paused or not
     */
    watch: function() {
      this.__starttime = Math.floor(Date.now());
      this.__offset = 0;
      this.paused = false
      this.__pausedtime = 0
    },
    /**
     * Returns the current time in miliseconds that the stopwatch has been running
     * @param {Object} watch - The watch object, see {@link quee_window.Stopwatch.watch}
     * @returns {int} Time in miliseconds
     * @function
     * @example
     * const watch1 = quee_window.Stopwatch.watch() // Make a watch object
     * var time = quee_window.Stopwatch.currenttime(watch1) // Get the current time from the watch object
     * console.log(time) // Logs the number of miliseconds since the start of the timer
     */
    currenttime: function(watch) {
      return (function() {
        if (watch.__paused) {
          return (watch.__pausedtime - watch.__starttime) - watch.__offset // Get the time since last paused, then subtract the offset from the pauses
        }
        else {
          temptime = Math.floor(Date.now());
          return (temptime - watch.__starttime) - watch.__offset // Get the current time since starting, then subtract the offset from the pauses
        }
      })
    },
    /**
     * Toggles the watch object's paused state
     * @param {Object} watch - The watch object, see {@link quee_window.Stopwatch.watch}
     * @function
     */
    pause: function(watch) {
      return (function() {
        if (watch.__paused) {
          temptime = Math.floor(Date.now());
          watch.__paused = false
          watch.__offset += temptime - watch.__pausedtime // Current time minus time last paused
        }
        else {
          watch.__paused = true
          watch.__pausedtime = Math.floor(Date.now()) // Paused time is now
        }
      })
    },
  }
}

/**
 * @namespace quee_image
 */
const quee_image = {
  /**
   * Loads an image into the quee.js database
   * @deprecated because {@link quee_image.LoadImages} is the best way to load images.
   * @function LoadImage
   * @memberof quee_image
   * @throws Will raise a warning if image is already assined to the given name
   * @param {string} url - Url of the image
   * @param {string} name - Name of the image (quee.js identifier)
   * 
   * @return {Promise} - Promise of the loaded image
   */
  LoadImage: function(url, name) {
    return new Promise((resolve, reject) => {
      if (name in __q__.globalImages) { // Check to see if the image already exists
        quee_window.Console.Warning("the image: " + name + " already exists")
      }
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
      img.onload = function(){
        __q__.globalImages[name] = img;
        quee_window.Console.Info("the image: " + name + " is loaded");
        resolve()
      }
    });
  },

  /**
   * Loads many images into the quee.js database
   * @async
   * @function LoadImages
   * @memberof quee_image
   * @throws Will raise a warning if image is already assigned to the given name
   * @param {Object} images - A dictionary of all the images to load, format:
   * @param {Object} images.key - A key is the name of the image
   * @param {Object} images.value - A value is the URL of the image
   * 
   * @param {function} callback - Callback function
   * 
   */
  LoadImages: async function(images, ncallback) {
    for (image in images) {
      await quee_image.LoadImage(images[image], image)
    }
    ncallback()
  },
}

/**
 * @namespace quee_input
 */
const quee_input = {
  /**
   * An interface with the keyboard
   * @namespace quee_input.Key
   * @property {string} quee_input.Key.Up - Up arrow key (Represents a key)
   * @property {string} quee_input.Key.Down - Down arrow key (Represents a key)
   * @property {string} quee_input.Key.Left - Left arrow key (Represents a key)
   * @property {string} quee_input.Key.Right - Right arrow key (Represents a key)
   * @property {string} quee_input.Key.PgUp - Page Up key (Represents a key)
   * @property {string} quee_input.Key.PgDown - Page Down key (Represents a key)
   * 
   * @property {string} quee_input.Key.Caps - Caps Lock key (Represents a key)
   * @property {string} quee_input.Key.Num - Num Lock key (Represents a key)
   * @property {string} quee_input.Key.Scrl - Scroll Lock key (Represents a key)
   * @property {string} quee_input.Key.Back - Backspace key (Represents a key)
   * @property {string} quee_input.Key.Esc - Escape key (Represents a key)
   * @property {string} quee_input.Key.Ctrl - Control key (Represents a key)
   * @property {string} quee_input.Key.CxtMnu - Context Menu key (Represents a key)
   * 
   * @property {string} quee_input.Key.ALL - Any key (Represents a key)
   * @property {string} quee_input.Key.NUMS - Any number key (Represents a key)
   */
  Key: {
    /**
     * Binds a callback function to a key
     * @throws Will raise a warning if key is already mapped
     * @function
     * @param {string} key - Key to be bound (Can be a {@link quee_input.Key} key as well)
     * @param {function} callback - Callback when key is pressed, parameters: (key)
     * @param {string} callback.key - Key that was pressed
     */
    Bind: function(key, callback) {
      if (key in __q__.globalCallbacks["key"]) { // Check if key is in global keybindings
        quee_window.Console.Warning("The keybind: " + key + " is already set.")
      }
      __q__.globalCallbacks["key"][key] = callback; // Set the global keybindings key to the callback
    },
    // List of shortners

    Up: "ArrowUp",
    Down: "ArrowDown",
    Left: "ArrowLeft",
    Right: "ArrowRight",
    PgUp: "PageUp",
    PgDown: "PageDown",

    Caps: "CapsLock",
    Num: "NumLock",
    Scrl: "ScrollLock",
    Back: "Backspace",
    Esc: "Escape",
    Ctrl: "Control",
    CxtMnu: "ContextMenu",

    ALL: "~~",
    NUMS: "~-",
  },
  /**
   * An interface with the mouse
   * @namespace quee_input.Mouse
   */
  Mouse: {
    /**
     * Set mouse move callback
     * @function
     * @param {function} callback - Callback when mouse moved, parameters: (x, y)
     * @param {int} callback.x - Current mouse x axis
     * @param {int} callback.y - Current mouse y axis
     */
    Move: function(callback) {
      __q__.globalCallbacks["mouse_move"] = callback
    },
    /**
     * Set mouse click callback
     * @function
     * @param {function} callback - Callback when mouse clicked, parameters: (x, y)
     * @param {int} callback.x - Current mouse x axis
     * @param {int} callback.y - Current mouse y axis
     */
    Click: function(callback) {
      __q__.globalCallbacks["mouse_click"] = callback
    }
  }
}

/**
 * @namespace quee_ui
 */
const quee_ui = {
  __canvas: document.getElementById("quee_canvas"),

 /**
   * The best way to move a sprite, text or world object. Also handles drawing, collisions, and moving the sprite, text or world. 
   * @namespace quee_ui.Move
   */
  Move: {
   /**
     * Returns a function that when called, moves the sprite or world object up, sets the collision properties, draws the world.
     * @function
     * @param {Object} item - Sprite or world object that will be moved, see {@link quee_ui.Sprite} or {@link quee_ui.World} or {@link quee_ui.Text}
     * @param {int} [px=10] - Number of pixles that the sprite will move
     * @return {Object} - Callback function
     */
    Up: function(item, px=10) {
      if (item.__type == "world") {
        return (function() {if (item.hidden == false) {item.y -= px;item.draw()}})
      }
      else if (item.__type == "sprite") {
        return (function() {if (item.__world.hidden == false) {item.y -= px;item.__backward = [0,px];item.__world.draw()}})
      }
      else {
        return (function() {if (item.__world.hidden == false) {item.y -= px;item.__world.draw()}})
      }
    },
   /**
     * Returns a function that when called, moves the sprite or world object down, sets the collision properties, draws the world.
     * @function
     * @param {Object} item - Sprite or world object that will be moved, see {@link quee_ui.Sprite} or {@link quee_ui.World} or {@link quee_ui.Text}
     * @param {int} [px=10] - Number of pixles that the sprite will move
     * @return {Object} - Callback function
     */
    Down: function(item, px=10) {
      if (item.__type == "world") {
        return (function() {if (item.hidden == false) {item.y += px;item.draw()}})
      }
      else if (item.__type == "sprite") {
        return (function() {if (item.__world.hidden == false) {item.y += px;item.__backward = [0,-px];item.__world.draw()}})
      }
      else {
        return (function() {if (item.__world.hidden == false) {item.y += px;item.__world.draw()}})
      }
    },
   /**
     * Returns a function that when called, moves the sprite or world object right, sets the collision properties, draws the world.
     * @function
     * @param {Object} item - Sprite or world object that will be moved, see {@link quee_ui.Sprite} or {@link quee_ui.World} or {@link quee_ui.Text}
     * @param {int} [px=10] - Number of pixles that the sprite will move
     * @return {Object} - Callback function
     */
    Right: function(item, px=10) {
      if (item.__type == "world") {
        return (function() {if (item.hidden == false) {item.x += px;item.draw()}})
      }
      else if (item.__type == "sprite") {
        return (function() {if (item.__world.hidden == false) {item.x += px;item.__backward = [-px,0];item.__world.draw()}})
      }
      else {
        return (function() {if (item.__world.hidden == false) {item.x += px;item.__world.draw()}})
      }
    },
   /**
     * Returns a function that when called, moves the sprite or world object left, sets the collision properties, draws the world.
     * @function
     * @param {Object} item - Sprite or world object that will be moved, see {@link quee_ui.Sprite} or {@link quee_ui.World} or {@link quee_ui.Text}
     * @param {int} [px=10] - Number of pixles that the sprite will move
     * @return {Object} - Callback function
     */
    Left: function(item, px=10) {
      if (item.__type == "world") {
        return (function() {if (item.hidden == false) {item.x -= px;item.draw()}})
      }
      else if (item.__type == "sprite") {
        return (function() {if (item.__world.hidden == false) {item.x -= px;item.__backward = [px,0];item.__world.draw()}})
      }
      else {
        return (function() {if (item.__world.hidden == false) {item.x -= px;item.__world.draw()}})
      }
    },
  },

  /**
   * Returns a function that when called, removes the sprite when the world is next drawn.
   * @function Delete
   * @memberof quee_ui
   * @param {Object} item - Sprite object to be removed
   * @param {bool} [draw=true] - Draw the world after the sprite is removed
   * @return {Object} - Function
   */
  Delete: function(item, draw=true) {
    if (draw) { // __q__.removeElement(__q__.globalSprites, tsprite);
      return (function() {item.__exist = false; item.__world.draw()})
    }
    else {
      return (function() {item.__exist = false})
    }
  },

  /**
   * Returns a function that when called, hides or shows the world element. If hidden nothing will happen to it or its sprites. Items can be removed however with {@link quee_ui.Delete}
   * @function Visibility
   * @memberof quee_ui
   * @param {Object} world - World object to be changed
   * @param {bool} visibility - if the world is visible or not
   * @return {Object} - Function
   */
  Visibility: function(world, visibility) {
    if (world.__type == "world") {
      if (visibility == true) {
        return (function() {world.hidden = false;world.draw()})
      }
      else if (visibility == false) {
        return (function() {world.hidden = true;world.clear()})
      }
      else {
        quee_window.Console.Error("visibility must be true or false")
      }
    }
    else {
      quee_window.Console.Error("cannot hide non-world object")
    }
  },
  
  /**
   * The sprite object
   * @constructor
   * @memberof quee_ui
   * @param {Object} world - World object that spite will be added to
   * @param {string} image - Image name, see {@link quee_image}
   * @param {Object} [options] - Sprite options
   * @param {int} [options.scale=1] - Sprite scale
   * @param {bool} [options.clip=true] - If collisions are enabled for this sprite
   * @param {bool} [options.click=true] - If sprite is clickable
   * 
   * @property {int} x - Sprite x cordinate
   * @property {int} y - Sprite x cordinate
   * @property {int} scale - Sprite scale
   * @property {int} clip - Sprite collisions
   * @property {int} click - Sprite can be clicked
   * 
   * @throws Will raise an error if image name does not exist
   */
  Sprite: function(world, image, options={}) {
    // Make sure that the options exist
    if ("scale" in options) {}
    else {options["scale"] = 1}
    if ("clip" in options) {}
    else {options["clip"] = true}
    if ("click" in options) {}
    else {options["click"] = true}

    this.x = 50
    this.y = 50
    this.scale = options["scale"]
    this.clip = options["clip"]
    this.click = options["click"]
    this.image = null

    this.__collision_callback = (function(){})
    this.__onclick_callback = (function(){})
    this.__backward = [0,0]
    this.__world = world
    this.__exist = true
    this.__type = "sprite"
    this.__collided = false

    if (image in __q__.globalImages) { // Check to make sure that image exists
      this.image = __q__.globalImages[image]
    }
    else {
      quee_window.Console.Error("The image: " + image + " does not exist!");
    }
    this.__world.__add(this);
    __q__.globalSprites.push(this)

    /**
     * Sets the collisions callback
     * @function
     * @memberof quee_ui.Sprite
     * @param {function} callback - Callback when collides with other sprite, parameters: (sprite)
     * @param {Object} callback.sprite - Sprite object that is being collided with
     */
    this.Collision = function(callback) {
      this.__collision_callback = callback;
    }

    /**
     * Changes the sprite image
     * @function
     * @memberof quee_ui.Sprite
     * @param {string} image - Image name, see {@link quee_image}
     * 
     * @throws Will raise an error if image name does not exist
     */
    this.ChangeImage = function(image) {
      if (image in __q__.globalImages) { // Check to make sure that image exists
        this.image = __q__.globalImages[image];
      }
      else {
        quee_window.Console.Error("The image: " + image + " does not exist!");
      }
    }

    /**
     * Sets the click collision
     * @function
     * @memberof quee_ui.Sprite
     * @param {function} callback - Callback when clicked by the mouse and 'click' property is true, parameters: (sprite)
     * @param {int} callback.x - Current mouse x axis
     * @param {int} callback.y - Current mouse y axis
     * 
     * @throws Will raise warning if 'click' property is false 
     */
    this.OnClick = function(callback) {
      if (this.click) { // Check to make sure that image exists
        this.__onclick_callback = callback;
      }
      else {
        quee_window.Console.Warning("OnClick will not be called, 'click' property is false")
      }
    },

    /**
     * Gets the sprite dimensions
     * @function
     * @memberof quee_ui.Sprite
     * 
     * @returns {Object} An array of [width, height] of the image
     */
    this.Dims = function() {
      if (this.image == null) {
        return [0,0]
      }
      else {
        var h = this.image.height * this.scale // Scale the height of the sprite
        var w = (this.image.width * this.scale) * this.image.height / this.image.width
        return [w,h]
      }
    }

    /**
     * Moves the sprite to the x and y
     * @function
     * @memberof quee_ui.Sprite
     * @param {int} x - x coordinate to go to
     * @param {int} x - y coordinate to go to
     */
    this.Goto = function(x, y) {
      this.x = x
      this.y = y
      this.__world.draw()
    }
  },

  /**
   * The text object
   * @constructor
   * @memberof quee_ui
   * @param {Object} world - World object that spite will be added to
   * @param {string} text - Text that will be displayed
   * @param {Object} [options] - Text options
   * @param {int} [options.size=30] - Font size
   * @param {string} [options.font="Arial"] - Font
   * 
   * @property {int} x - Text x cordinate
   * @property {int} y - Text x cordinate
   * @property {int} text - Text that will be displayed
   * @property {int} size - Font size
   * @property {int} font - Font
   * 
   */
  Text: function(world, text, options={}) {
    // Make sure that options exist
    if ("size" in options) {}
    else {options["size"] = 30}
    if ("font" in options) {}
    else {options["font"] = "Arial"}

    this.x = 50
    this.y = 50
    this.text = text
    this.size = options["size"]
    this.font = options["font"]

    this.__exist = true
    this.__world = world
    this.__type = "text"

    this.__world.__add(this); // Add to the worlds list

    /**
     * Moves the text to the x and y
     * @function
     * @memberof quee_ui.Text
     * @param {int} x - x coordinate to go to
     * @param {int} y - y coordinate to go to
     */
    this.Goto = function(x, y) {
      this.x = x
      this.y = y
      this.__world.draw()
    }
  },

  /**
   * The world object, there may be more that one world object.
   * @constructor
   * @memberof quee_ui
   * 
   * @property {int} x - World x cordinate
   * @property {int} y - World x cordinate
   * @property {bool} hidden - If the world is hidden or not
   * @property {int} maxspritenum - Sets the maximum number of sprites that the world can hold. <strong>WARNING: Higher values may crash computer</strong>
   */
  World: function() { // The current UI interface.
    quee_window.Console.Info("world created")
    this.__sprites = []

    this.maxspritenum = 400
    this.hidden = false
    this.x = 0
    this.y = 0

    this.__type = "world"

    this.__add = function(sprite) {
      if (this.__sprites.length > this.maxspritenum) { // Makes sure that not too many sprites are on the screen
        quee_window.Console.Error("Cannot load more sprites, maximum number reached: " + this.maxspritenum.toString())
      }
      else {
        if (this.__sprites.length > Math.round(this.maxspritenum * .75)) {
          quee_window.Console.Warning("Nearing max sprites number: " + this.maxspritenum.toString())
        }
        this.__sprites.push(sprite) // Add sprite to list of sprites
        quee_window.Console.Info("Loaded: " + sprite.__type + " object")
      }
    }

    /**
     * Refreashes the entire world; clears world, runs collisions, and removes sprites. Note: Sprites will not be removed and collisions will not occur until draw() is called.
     * @function
     * @memberof quee_ui.World
     */
    this.draw = function() { // Updates the entire world
      if (this.hidden == false) {
        this.clear()
        ctx = quee_ui.__canvas.getContext("2d")

        var collisions = __q__.ifCollision(this.__sprites) // Get list of all collisions

        for (sprite in this.__sprites) {
          this.__sprites[sprite].__collided = false // Makes sure all sprites are not collided
        }

        for (collision in collisions) { // Run the callbacks for each of the two     collisions.
          if (collisions[collision][0].__collided) {} // If they have already been collided, dont do anything
          else {
            collisions[collision][0].__collision_callback(collisions[collision][1])
            collisions[collision][0].x += collisions[collision][0].__backward[0]
            collisions[collision][0].y += collisions[collision][0].__backward[1]
            collisions[collision][0].__collided = true
          }
          if (collisions[collision][1].__collided) {}// If they have already been collided, dont do anything
          else {
            collisions[collision][1].__collision_callback(collisions[collision][0])
            collisions[collision][1].x += collisions[collision][1].__backward[0]
            collisions[collision][1].y += collisions[collision][1].__backward[1]
            collisions[collision][1].__collided = true
          }
        }

        var newlist = []

        for (spritenum in this.__sprites) {
          if (this.__sprites[spritenum]["__exist"] == false) {
            if (this.__sprites[spritenum].__type == "sprite") {
              __q__.removeSprites(this.__sprites[spritenum])}
            }
          else {
            newlist.push(this.__sprites[spritenum])
            sprite = this.__sprites[spritenum]
            if (sprite.__type == "text") {
              ctx.font = sprite.size.toString() + "px " + sprite.font; // Assemble font
              ctx.fillText(sprite.text,sprite.x+this.x,sprite.y+this.y);
            }
            else {
              const [x2, y2, w2, h2] = __q__.getDims(sprite);
              //(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2)
              if (x2 > (quee_ui.__canvas.width-w2-w2) + w2 || w2 > w2 + x2 || y2 >   (quee_ui.__canvas.height-h2-h2) + h2 || h2 > h2 + y2){
                sprite.__collision_callback(quee_ui.__canvas)
                sprite.x += sprite.__backward[0]
                sprite.y += sprite.__backward[1]
              }
  
              ctx.drawImage(sprite.image, sprite["x"]+this.x, sprite["y"]+this.y, sprite.image.height * sprite["scale"], (sprite.image.width * sprite["scale"]) * sprite.image.height / sprite.image.width); // Draw the image on the screen
              if (__q__.dbg["cbox"]) {
                ctx.strokeRect(sprite["x"]+this.x, sprite["y"]+this.y, sprite.image.height * sprite["scale"], (sprite.image.width * sprite["scale"]) * sprite.image.height / sprite.image.width)
              }
            }
          }
        }
        this.__sprites = newlist
      }
      else {
        this.clear()
      }
    }
    /**
     * Clears drawings off the world
     * @function
     * @memberof quee_ui.World
     */
    this.clear = function() { // Will wipe graphics off the screen, will only clear graphics, collisions and onclicks will still occur.
      ctx = quee_ui.__canvas.getContext("2d")
      ctx.clearRect(0, 0, quee_ui.__canvas.width, quee_ui.__canvas.height); // Clear all assets off the screen
    },

    /**
     * Moves the world to the x and y
     * @function
     * @memberof quee_ui.World
     * @param {int} x - x coordinate to go to
     * @param {int} y - y coordinate to go to
     */
    this.Goto = function(x, y) {
      this.x = x
      this.y = y
      this.__world.draw()
    }
  }
}

/**
 * Runs the quee command specifyed. <strong>For use in the DevTools commandline.</strong>
 *  
 * @param {string} string - A string of the quee command
 * @param {dictionary} args - The list of args for the quee command. (OPTIONAL)
 * 
 * @param {command} string.dbg - The debug commands group
 * @param {command} string.dbg.cbox - Enable the collision boxes, command: "dbg cbox"
 * @param {command} string.dbg.mximnm - Gets the maximum number of object that world can hold, command "dbg mximnm", args {"wld":world object}
 * @param {command} string.dbg.clearsp - Clears all sprites from the world, command "dbg clearsp", args {"wld":world object}
 * 
 * @param {command} string.disablecommands - Disables all commands until reloaded (Mainly called IN the JavaScript file), command "disablecommands"
 * 
 * @function quee_cmd
 * @returns The output of the command
 * 
 * 
 * @example <caption>How to use the quee_cmd function</caption>
 * // Right click -> Inspect Element -> Console
 * // In the console window, type quee_cmd("<your command here>", args={"<arg1 name>":"<arg1 value>"})
 */
function quee_cmd(string="", args={}) {
  if (__q__.dbg["commands_enabled"]) {
    var commands = string.split(" ")
    if (commands[0] == "dbg") {
      if (commands[1] == "cbox") {
        if (__q__.dbg["cbox"]) {
          __q__.dbg["cbox"] = false
          return "quee debug cbox | set to false"
        }
        else {
          __q__.dbg["cbox"] = true
          return "quee debug cbox | set to true"
        }
      }
      if (commands[1] == "mximnm") {
        if ("wld" in args) {
          if ("maxspritenum" in args["wld"]) {
            return "quee debug msimnm | " + args["wld"]["maxspritenum"] + " sprites"
          }
          else {
            return "quee debug msimnm | wld argument must be a valid world"
          }
        }
        else {
          return "quee debug msimnm | args must contain a wld tag"
        }
      }
      if (commands[1] == "clearsp") {
        if ("wld" in args) {
          if ("__sprites" in args["wld"]) {
            args["wld"]["__sprites"] = []
            return "quee debug clearsp | sprites cleared"
          }
          else {
            return "quee debug clearsp | wld argument must be a valid world"
          }
        }
        else {
          return "quee debug clearsp | args must contain a wld tag"
        }
      }
    }
    else if (commands[0] == "disablecommands") {
      __q__.dbg["commands_enabled"] = false
      return "quee disablecommands | commands disabled"
    }
    else if (commands[0] == "") {
      return "quee | empty command"
    }
    return "quee | command error"
  }
  else {
    return "quee | cannot use commands, disabled"
  }
}