//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
mongoose.connect("mongodb+srv://Hemanth_Varkolu_2112:2hREwzd6i4OxFD7h@cluster0.0lz0xhw.mongodb.net/todolistDB");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const firstItem = new Item({
  name: "Welcome to the to-do list."
});
//firstItem.save();
const secondItem = new Item({
  name: "Hit the + Button to aff a new item."
});
//secondItem.save();
const thirdItem = new Item({
  name: "<-- Hit this to delete an item."
});
//thirdItem.save();
const defaultItems = [firstItem, secondItem, thirdItem];
Item.find({}, function(err, foundItems) {
  if (err) {
    console.log(err);
  } else {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("succesfully inserted items");
        }
      });
    }
  }
});

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List",listsSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {
  const item = req.body.newItem;
  const addedItem = new Item({
    name: item
  });
  const listName = req.body.list;
  if(listName === "Today"){
    addedItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
      if(!err){
        foundList.items.push(addedItem);
        foundList.save();
        res.redirect("/"+listName);
      }
    });
  }
});

app.post("/delete",function(req,res){
  const delteItemID = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.deleteOne({_id:delteItemID},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("item deleted succesfully");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:delteItemID}}},function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
});

app.get("/:categorytxt",function(req,res){
  const coustemListName = _.capitalize(req.params.categorytxt);
  List.findOne({name:coustemListName},function(err,results){
    if(err){
      console.log("err");
    }else{
      if(results === null){
        const list = new List({
          name: coustemListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+coustemListName);
      }else{
        res.render("list",{
          listTitle: coustemListName,
          newListItems: results.items
        });
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
