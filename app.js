/*
  app.js -- This creates an Express webserver
*/


// First we load in all of the packages we need for the server...
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
//const bodyParser = require("body-parser");
const axios = require("axios");
var debug = require("debug")("personalapp:server");

// Now we create the server
const app = express();

const mongoose = require( 'mongoose' );
//mongoose.connect( `mongodb+srv://${auth.atlasAuth.username}:${auth.atlasAuth.password}@cluster0-yjamu.mongodb.net/authdemo?retryWrites=true&w=majority`);
mongoose.connect( 'mongodb://localhost/authDemo');
//const mongoDB_URI = process.env.MONGODB_URI
//mongoose.connect(mongoDB_URI)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});


// Here we specify that we will be using EJS as our view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Here we process the requests so they are easy to handle
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Here we specify that static files will be in the public folder
app.use(express.static(path.join(__dirname, "public")));

// Here we enable session handling ..
app.use(
  session({
    secret: "zzbbya789fds89snana789sdfa",
    resave: false,
    saveUninitialized: false
  })
);

//app.use(bodyParser.urlencoded({ extended: false }));

// This is an example of middleware
// where we look at a request and process it!
app.use(function(req, res, next) {
  //console.log("about to look for routes!!! "+new Date())
  console.log(`${req.method} ${req.url}`);
  //console.dir(req.headers)
  next();
});

// here we start handling routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/demo",
        function (req, res){res.render("demo");});

app.get("/about", (request, response) => {
  response.render("about");
});

app.get("/quiz1", (request, response) => {
  response.render("quiz1");
});

app.get("/grading", (request, response) => {
  response.render("grading");
});

app.get("/form", (request,response) => {
  response.render("form")
})

app.post("/showformdata", (request,response) => {
  response.json(request.body)
})

app.get("/form2", (request,response) => {
  response.render("form2")
})


app.post("/showNameAge", (request,response) => {
  response.locals.name=request.body.fullname
  response.locals.age =request.body.age
  response.render("form2data")
})



app.post("/reflectFormData",(req,res) => {
  res.locals.title = "Form Demo Page"
  res.locals.name = req.body.fullname
  res.locals.body = req.body
  res.locals.demolist = [2,3,5,7,11,13]
  res.render('reflectData')
})



app.get("/dataDemo", (request,response) => {
  response.locals.name="Tim Hickey"
  response.locals.vals =[1,2,3,4,5]
  response.locals.people =[
    {'name':'Tim','age':65},
    {'name':'Yas','age':29}]
  response.render("dataDemo")
})

app.get("/triangleArea", (request,response) => {
  response.render("triangleArea")
})

app.post('/calcTriangleArea', (req,res) => {
  const a = parseFloat(req.body.a) // converts form parameter from string to float
  const b = parseFloat(req.body.b)
  const c = parseFloat(req.body.c)
  const s = (a+b+c)/2
  const area = Math.sqrt(s*(s-a)*(s-b)*(s-c))
  res.locals.a = a
  res.locals.b = b
  res.locals.c = c
  res.locals.area = area
  //res.json({'area':area,'s':s})
  res.render('showTriangleArea')
})

app.get("/restaurant", (request,response) => {
  response.render("restaurant")
})

app.post('/restaurantHelper', (req,res) => {
  const mealCost = parseFloat(req.body.mealCost)
  const tipRate = parseFloat(req.body.tipRate)
  const numGuests = parseFloat(req.body.numGuests)
  const costPerPerson=
     ((mealCost + (mealCost * (tipRate / 100))) / numGuests).toFixed(2)
  res.locals.mealCost = mealCost
  res.locals.tipRate = tipRate
  res.locals.numGuests = numGuests
  res.locals.costPerPerson = costPerPerson
  res.render('restaurantCost')
})

let todoItems = []

app.get('/todo', (req,res) => {
  res.locals.todoItems = todoItems
  res.render('todo')
})

app.post('/storeTodo',(req,res) => {
  const todoitem = req.body.todoitem
  todoItems = todoItems.concat({'todo':todoitem})
  console.log("Inside storeTodo")
  console.dir(todoItems)  // debug step ..
  res.locals.todoItems = todoItems
  res.render('todo')
})

const Music = require('./models/Music')

app.get('/music', async (req,res,next) => {
  res.render('music')
})

app.post("/music",

  async (req,res,next) => {
    const item = req.body.item
    const description = req.body.description
    const customselect = req.body.customselect
    const iwant = req.body.iwant
    const contact = req.body.contact

    const musicpiece = new Music({

      item:item,
      description:description,
      customselect:customselect,
      iwant:iwant,
      contact:contact,
    })

    const result = await musicpiece.save()
    console.log('result=')
    console.dir(result)
    res.redirect('/musics')
  })

  app.get('/musics',
  async (req,res,next) => {
    res.locals.musics = await Music.find({})
    console.log('musics='+JSON.stringify(res.locals.musics.length))
    res.render('musics')
  })

  app.get('/musicremove/:musicpiece_id',
  async (req,res,next) => {
    const musicpiece_id = req.params.musicpiece_id
    console.log(`id=${musicpiece_id}`)
    await Music.deleteOne({_id:musicpiece_id})
    res.redirect('/musics')
  })

  const ArtForum = require('./models/ArtForum')

  app.get('/artForum', async (req,res,next) => {
    res.render('artForum')
  })

  app.post("/artForum",

    async (req,res,next) => {
      const item = req.body.item
      const description = req.body.description
      const customselect = req.body.customselect
      const iwant = req.body.iwant
      const contact = req.body.contact

      const artforumpiece = new ArtForum({

        item:item,
        description:description,
        customselect:customselect,
        iwant:iwant,
        contact:contact,
      })

      const result = await artforumpiece.save()
      console.log('result=')
      console.dir(result)
      res.redirect('/artForums')
    })

    app.get('/artForums',
    async (req,res,next) => {
      res.locals.artForums = await ArtForum.find({})
      console.log('artforums='+JSON.stringify(res.locals.artForums.length))
      res.render('artForums')
    })

    app.get('/artForumremove/:artforumpiece_id',
    async (req,res,next) => {
      const artforumpiece_id = req.params.artforumpiece_id
      console.log(`id=${artforumpiece_id}`)
      await ArtForum.deleteOne({_id:artforumpiece_id})
      res.redirect('/artforums')
    })

    const Bookschool = require('./models/Bookschool')

    app.get('/bookschool', async (req,res,next) => {
      res.render('bookschool')
    })

    app.post("/bookschool",

      async (req,res,next) => {
        const item = req.body.item
        const description = req.body.description
        const customselect = req.body.customselect
        const iwant = req.body.iwant
        const contact = req.body.contact

        const bookschoolpiece = new Bookschool({

          item:item,
          description:description,
          customselect:customselect,
          iwant:iwant,
          contact:contact,
        })

        const result = await bookschoolpiece.save()
        console.log('result=')
        console.dir(result)
        res.redirect('/bookschools')
      })

      app.get('/bookschools',
      async (req,res,next) => {
        res.locals.bookschools = await Bookschool.find({})
        console.log('bookschools='+JSON.stringify(res.locals.bookschools.length))
        res.render('bookschools')
      })

      app.get('/bookschoolremove/:bookschoolpiece_id',
      async (req,res,next) => {
        const bookschoolpiece_id = req.params.bookschoolpiece_id
        console.log(`id=${bookschoolpiece_id}`)
        await Bookschool.deleteOne({_id:bookschoolpiece_id})
        res.redirect('/bookschools')
      })

      const Household = require('./models/Household')

      app.get('/household', async (req,res,next) => {
        res.render('household')
      })

      app.post("/household",

        async (req,res,next) => {
          const item = req.body.item
          const description = req.body.description
          const customselect = req.body.customselect
          const iwant = req.body.iwant
          const contact = req.body.contact

          const householdpiece = new Household({

            item:item,
            description:description,
            customselect:customselect,
            iwant:iwant,
            contact:contact,
          })

          const result = await householdpiece.save()
          console.log('result=')
          console.dir(result)
          res.redirect('/households')
        })

        app.get('/households',
        async (req,res,next) => {
          res.locals.households = await Household.find({})
          console.log('households='+JSON.stringify(res.locals.households.length))
          res.render('households')
        })

        app.get('/householdremove/:householdpiece_id',
        async (req,res,next) => {
          const householdpiece_id = req.params.householdpiece_id
          console.log(`id=${householdpiece_id}`)
          await Household.deleteOne({_id:householdpiece_id})
          res.redirect('/households')
        })

        const Tech = require('./models/Tech')

        app.get('/tech', async (req,res,next) => {
          res.render('tech')
        })

        app.post("/tech",

          async (req,res,next) => {
            const item = req.body.item
            const description = req.body.description
            const customselect = req.body.customselect
            const iwant = req.body.iwant
            const contact = req.body.contact

            const musicpiece = new Tech({

              item:item,
              description:description,
              customselect:customselect,
              iwant:iwant,
              contact:contact,
            })

            const result = await techpiece.save()
            console.log('result=')
            console.dir(result)
            res.redirect('/techs')
          })

          app.get('/techs',
          async (req,res,next) => {
            res.locals.techs = await Tech.find({})
            console.log('techs='+JSON.stringify(res.locals.techs.length))
            res.render('techs')
          })

          app.get('/techremove/:techpiece_id',
          async (req,res,next) => {
            const techpiece_id = req.params.techpiece_id
            console.log(`id=${techpiece_id}`)
            await Tech.deleteOne({_id:techpiece_id})
            res.redirect('/techs')
          })
// Here is where we will explore using forms!



// this example shows how to get the current US covid data
// and send it back to the browser in raw JSON form, see
// https://covidtracking.com/data/api
// for all of the kinds of data you can get
app.get("/c19",
  async (req,res,next) => {
    try {
      const url = "https://covidtracking.com/api/v1/us/current.json"
      const result = await axios.get(url)
      res.json(result.data)
    } catch(error){
      next(error)
    }
})

// this shows how to use an API to get recipes
// http://www.recipepuppy.com/about/api/
// the example here finds omelet recipes with onions and garlic
app.get("/omelet",
  async (req,res,next) => {
    try {
      const url = "http://www.recipepuppy.com/api/?i=onions,garlic&q=omelet&p=3"
      const result = await axios.get(url)
      res.json(result.data)
    } catch(error){
      next(error)
    }
})

app.get("/hwForm", (req,res) => {
  res.render("hwForm")
})

app.post("/hwForm", (req,res) => {
  const fullname = req.body.fullname
  const age = req.body.age
  const interest = req.body.interest
  const over18 = req.body.over18
  res.locals.fullname= fullname
  res.locals.age= age
  res.locals.interest= interest
  res.locals.over18= over18
  res.render("hwFormData")
})

app.get('/art', (req,res) => {
  res.render('artFun')
})

app.post("/artFun",
  async (req,res,next) => {
    try {
      const food = req.body.art
      const url = "https://api.artic.edu/api/v1/artworks/search?q="+req.body.art
      const result = await axios.get(url)
      // console.dir(result.data)
      // console.log('results')
      // console.dir(result.data.results)
      res.locals.results = result.data.data
      //res.json(result.data.data)
      res.render('artFunShow')
    } catch(error){
      next(error)
    }
})

// Don't change anything below here ...

// here we catch 404 errors and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// this processes any errors generated by the previous routes
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//Here we set the process.env.PORT to use
const process.env.process.env.PORT = "5000";
app.set("process.env.PORT", process.env.PORT);

// and now we startup the server listening on that port
const http = require("http");
const server = http.createServer(app);

server.listen(process.env.PORT);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "process.env.PORT " + addr.process.env.PORT;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof process.env.PORT === "string" ? "Pipe " + process.env.PORT : "process.env.PORT " + process.env.PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exprocess.env.PORTs = app;
