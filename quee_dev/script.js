var world = new quee_ui.World()
quee_window.Canvas()
var watch = new quee_window.Stopwatch.watch()
const short = quee_window.Stopwatch

quee_image.LoadImages({
  "right" : "/demos/imgs/right.png",
  "left" : "/demos/imgs/left.png",
  "block" : "/demos/imgs/block.png",
}, mainloop);

function loop() {
  if (locale.quee.mouse_clicked) {
    xandy = locale.quee.mouse_position
    //dims = sprite.Dims()
    sprite.x = xandy[0]// - dims[0] / 2
    sprite.y = xandy[1]// - dims[1] / 2
    world.draw()
  }
}

function mainloop() {
  var sprite = new quee_ui.Sprite(world, "right")
  var block = new quee_ui.Sprite(world, "block")
  var text = new quee_ui.Text(world, "YAY")

  block.x = 100
  block.y = 100
  world.draw()

  quee_input.Mouse.Move((function (x,y) {console.log(locale.quee.mouse_clicked); if (locale.quee.mouse_clicked) {text.goto(x,y)}}))

  quee_input.Key.Bind("w", quee_ui.Move.Up(sprite))
  quee_input.Key.Bind("s", quee_ui.Move.Down(sprite))
  quee_input.Key.Bind("a", left)
  quee_input.Key.Bind("d", right)

  quee_input.Key.Bind("p", short.pause(watch))

  quee_input.Key.Bind("~~", changekey)

  quee_input.Key.Bind("h", (function(){world.hidden = true}))
  quee_input.Key.Bind("f", (function(){world.hidden = false}))

  function changekey(key) {
    text.text = "Last Key: " + key
    text.size = 10
    console.log(short.currenttime(watch)())
    world.draw()
  }

  function left() {
    sprite.ChangeImage("left")
    quee_ui.Move.Left(sprite)()
  }
  function right() {
    sprite.ChangeImage("right")
    quee_ui.Move.Right(sprite)()
  }
}