//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.set("strictQuery", true);

const app = express();

mongoose.connect("mongodb://localhost:27017/todolistDB");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const ItemSchema = {
  name: String,
};
const Item = mongoose.model("Item", ItemSchema);
const Item1 = new Item({
  name: "Shopping",
});
const Item2 = new Item({
  name: "Movie Time",
});
const Item3 = new Item({
  name: "Coding",
});
const defaultItems = [Item1, Item2, Item3];

const ListSchema = {
  name: String,
  item: [ItemSchema],
};
const List = mongoose.model("List", ListSchema);

app.get("/", function (req, res) {

  Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (!err) {
          res.redirect("/");
        }
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const listName = req.body.list;
  const itemName = req.body.newItem;

  const itemname = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    itemname.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.item.push(itemname);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  const listName = req.body.custom_name;
  const checkedItemId = req.body.checkbox_id;
  const title = req.body.title_name;
 
  if (title === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: title },
      { $pull: { item: { name: listName } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + title);
        }
      }
    );
  }
});

app.post("/other", function (req, res) {
  const temp = req.body.newItemB;
  res.redirect("/" + temp);
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          item: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.item,
        });
      }
    }
  });
});

app.post("/deletelist", function (req, res) {
  const listName = req.body.list;

  List.findOneAndDelete({ name: listName }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
