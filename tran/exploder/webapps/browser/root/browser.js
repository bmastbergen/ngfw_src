// Copyright (c) 2006 Metavize Inc.
// All rights reserved.

var openImg = new Image();
openImg.src = "open.gif";
var closedImg = new Image();
closedImg.src = "closed.gif";

function expandDir(dir)
{
  var dirElem = $(dir);

  if (isFetchable(dirElem)) {
    new Ajax.Request("ls",
                     { method: "get",
                       parameters: "url=" + dir + "&type=dir",
                       onComplete: function(req)
                                   {
                                     var resp = parseDomFromString(req.responseText);
                                     var root = resp.getElementsByTagName('root')[0];
                                     if (isFetchable(dirElem)) {
                                       addChildDirectories(dirElem, root);
                                     }
                                   }
                     });
  } else {
    toggleTree(dir);
  }
}

function showFileListing(dir)
{
  new Ajax.Request("ls",
                   { method: "get",
                     parameters: "url=" + dir + "&type=full",
                     onComplete: function(req)
                                 {
                                   var resp = parseDomFromString(req.responseText);
                                   var root = resp.getElementsByTagName('root')[0];
                                   // XXX check if we are the last outstanding request
                                   displayDetail(root);
                                 }
                   });
}

function displayDetail(root)
{
  var detail = $("detail");

  var table = document.createElement("table");
  Element.addClassName(table, "detail-table");

  var thead = table.appendChild(document.createElement("thead"));
  appendTextElem(thead, "th", "name", null);
  appendTextElem(thead, "th", "size", null);
  appendTextElem(thead, "th", "last modified", null);
  appendTextElem(thead, "th", "create date", null);

  var tbody = table.appendChild(document.createElement("tbody"));

  var path = root.getAttribute("path");
  var children = root.childNodes;

  var odd = true;
  for (var i = 0; i < children.length; i++) {
    var child = root.childNodes[i];
    var tagName = child.tagName;
    if ("dir" == tagName || "file" == tagName) {
      addDetail(child, path, tbody, odd);
      odd = !odd;
    }
  }

  removeChildren(detail);
  detail.appendChild(table);
}

function addDetail(fileInfo, path, tbody, odd)
{
  var row = tbody.appendChild(document.createElement("tr"));

  var name = fileInfo.getAttribute("name");
  row.onclick = function() { showFileListing(path + name); };

  Element.addClassName(row, "detail-row");
  Element.addClassName(row, "detail-row-" + (odd ? "odd" : "even"));

  appendTextElem(row, "td", name, "detail-name");
  appendTextElem(row, "td", fileInfo.getAttribute("size"), "detail-size");
  var date = new Date();
  date.setTime(parseInt(fileInfo.getAttribute("mtime")));
  appendTextElem(row, "td", date.toLocaleString(), "detail-mtime");
  date = new Date();
  date.setTime(parseInt(fileInfo.getAttribute("ctime")));
  appendTextElem(row, "td", date.toLocaleString(), "detail-ctime");
}

function appendTextElem(parent, type, text, clazz)
{
  var td = document.createElement(type);
  if (null != clazz) {
    Element.addClassName(td, clazz);
  }
  td.appendChild(document.createTextNode(text));
  parent.appendChild(td);

  return td;
}

function addChildDirectories(target, dom)
{
  var path = target.getAttribute("id");

  for (var i = 0; i < dom.childNodes.length; i++) {
    if ("dir" == dom.childNodes[i].tagName) {
      var name = dom.childNodes[i].getAttribute("name");
      var childPath = path + name;
      addChildDirectory(target, name, childPath);
    }
  }

  toggleTree(path);
}

function addChildDirectory(target, name, path)
{
  var trig = document.createElement("span");
  Element.addClassName(trig, "trigger");

  var img = document.createElement("img");
  img.setAttribute("src", "closed.gif");
  img.setAttribute("id", "I" + path);
  img.onclick = function() { expandDir(path); };
  trig.appendChild(img);

  var listTrigger = document.createElement("span");
  Element.addClassName(listTrigger, "list-trigger");
  listTrigger.onclick = function() { showFileListing(path); };

  var text = document.createTextNode(name.substring(0, name.length - 1));
  listTrigger.appendChild(text);

  trig.appendChild(listTrigger);

  var br = document.createElement("br");
  trig.appendChild(br);

  var dir = document.createElement("span");
  Element.addClassName(dir, "dir");
  dir.setAttribute("id", path);

  target.appendChild(trig);
  target.appendChild(dir);
}

function toggleTree(dir)
{
  var dirElem = $(dir);
  var dirStyle = dirElem.style;
  var dirImg = $("I" + dir);

  if (dirStyle.display == "block") {
    dirStyle.display = "none";
    dirImg.src = closedImg.src;
  } else {
    dirStyle.display = "block";
    dirImg.src = openImg.src;
  }
}

function isFetchable(target)
{
  // XXX add leaf node checking
  return 0 == target.childNodes.length;
}

function parseDomFromString(text)
{
  return Try.these(function()
                   {
                     return new DOMParser().parseFromString(text, 'text/xml');
                   },
                   function()
                   {
                     var xmlDom = new ActiveXObject("Microsoft.XMLDOM")
                     xmlDom.async = "false"
                     xmlDom.loadXML(text)
                     return xmlDom;
                   });
}

// function removeChildren(node)
function removeChildren(node)
{
  while (null != node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
