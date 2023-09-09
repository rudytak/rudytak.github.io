# Jroozy CMS Table Documentation

## Project structure

The main part of Jroozy CMS Table plugin is and iframe showing the table itself. The iframe can be controlled externally via postMessage. The UI is creates using WIX blocks for simplicity, modifiability and visual coherence.

## Possible iframe actions

### Loading the CMS data

The whole CMS data can be retreivend using the wix-data API. This data should tehn be passed to the iframe once at the start after the page is loaded.

#### postMessage interface
```
{
    jroozy: true,
    action: "load_CMS"
    items: [
        {
            _props: any
            ...
        },
        ...
    ],
    total_items: number
}
```

#### Example:
```js
$w("#html1").postMessage({
    jroozy: true,
    action: "load_CMS",
    items: [
        {
            "Column 1": 1500,
            "Column 2": "abcd",
            "Column 3": "foo",
        },
        
    ],
    total_items: 3,
})
```

### Search

All of the items can be searched. During a search only the items that contain the searched word in any of their properties are shown.

#### postMessage interface
```
{
    jroozy: true,
    action: "search",
    search_phrase: string
}
```

#### Example:
```js
$w("#html1").postMessage({
    jroozy: true,
    action: "search",
    search_phrase: document.getElementById("srch").value
})
```

### Hide or show columns

Columns can be hidden by being added to an internal blacklist. They can then also be shown by being removed from the blacklist.

#### postMessage interface
```
{
    jroozy: true,
    action: "hide_columns" | "show_columns",
    columns: string[]
}
```

#### Example:
```js
$w("#html1").postMessage({
    jroozy: true,
    action: "hide_columns",
    columns: [document.getElementById("cols_hide").value]
})
```

```js
$w("#html1").postMessage({
    jroozy: true,
    action: "show_columns",
    columns: [document.getElementById("cols_show").value]
})
```

### Set paging

Data can is paged for performance reasons. The size and index of the page shoun can be set using the following postMessage call.

#### postMessage interface
```
{
    jroozy: true,
    action: "search",
    page_num: number
    page_size: number
}
```

#### Example:
```js
$w("#html1").postMessage({
    jroozy: true,
    action: "page",
    page_num: document.getElementById("page_num").valueAsNumber,
    page_size: document.getElementById("page_size").valueAsNumber
})
```

### Open settings

The settings modal for custom filters and column visibility overview can be externally oepened using the following postMessage call.

#### postMessage interface
```
{
    jroozy: true,
    action: action: "open_settings"
}
```

#### Example:
```js
$w("#html1").postMessage({
    jroozy: true,
    action: "open_settings"
})
```

### Sort by column

The data can also by sorted by column in any order. sort_order is a number corresponding to the order in which the elements will be sorted follwoing this table:
 1 = ascending
 0 = unsorted
-1 = descending
sort_column is the unique index of the column a.k.a. the property name.

#### postMessage interface
```
{
    jroozy: true,
    action: action: "sort",
    sort_order: -1 | 0 | 1, 
    sort_column: string
}
```

#### Example:
```js
$w("#html1").postMessage({
    jroozy: true,
    action: "sort",
    sort_order: document.getElementById("sort_order").valueAsNumber, // 1 (ascending), 0 or -1 (descending)
    sort_column: document.getElementById("sort_column").value
})
```