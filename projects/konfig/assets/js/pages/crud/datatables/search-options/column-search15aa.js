"use strict";var KTDatatablesSearchOptionsColumnSearch=function(){$.fn.dataTable.Api.register("column().title()",(function(){return $(this.header()).text().trim()}));return{init:function(){var t;t=$("#kt_datatable").DataTable({responsive:!0,dom:"<'row'<'col-sm-12'tr>>\n\t\t\t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>",lengthMenu:[5,10,25,50],pageLength:10,language:{lengthMenu:"Display _MENU_"},searchDelay:500,processing:!0,serverSide:!0,ajax:{url:HOST_URL+"/api/datatables/demos/server.php",type:"POST",data:{columnsDef:["RecordID","OrderID","Country","ShipCity","CompanyAgent","ShipDate","Status","Type","Actions"]}},columns:[{data:"RecordID"},{data:"OrderID"},{data:"Country"},{data:"ShipCity"},{data:"CompanyAgent"},{data:"ShipDate"},{data:"Status"},{data:"Type"},{data:"Actions",responsivePriority:-1}],initComplete:function(){var a=this,e=$('<tr class="filter"></tr>').appendTo($(t.table().header()));this.api().columns().every((function(){var a,n=this;switch(n.title()){case"Record ID":case"Order ID":case"Ship City":case"Company Agent":a=$('<input type="text" class="form-control form-control-sm form-filter datatable-input" data-col-index="'+n.index()+'"/>');break;case"Country":a=$('<select class="form-control form-control-sm form-filter datatable-input" title="Select" data-col-index="'+n.index()+'">\n\t\t\t\t\t\t\t\t\t\t<option value="">Select</option></select>'),n.data().unique().sort().each((function(t,e){$(a).append('<option value="'+t+'">'+t+"</option>")}));break;case"Status":var l={1:{title:"Pending",class:"label-light-primary"},2:{title:"Delivered",class:" label-light-danger"},3:{title:"Canceled",class:" label-light-primary"},4:{title:"Success",class:" label-light-success"},5:{title:"Info",class:" label-light-info"},6:{title:"Danger",class:" label-light-danger"},7:{title:"Warning",class:" label-light-warning"}};a=$('<select class="form-control form-control-sm form-filter datatable-input" title="Select" data-col-index="'+n.index()+'">\n\t\t\t\t\t\t\t\t\t\t<option value="">Select</option></select>'),n.data().unique().sort().each((function(t,e){$(a).append('<option value="'+t+'">'+l[t].title+"</option>")}));break;case"Type":l={1:{title:"Online",state:"danger"},2:{title:"Retail",state:"primary"},3:{title:"Direct",state:"success"}},a=$('<select class="form-control form-control-sm form-filter datatable-input" title="Select" data-col-index="'+n.index()+'">\n\t\t\t\t\t\t\t\t\t\t<option value="">Select</option></select>'),n.data().unique().sort().each((function(t,e){$(a).append('<option value="'+t+'">'+l[t].title+"</option>")}));break;case"Ship Date":a=$('\n    \t\t\t\t\t\t\t<div class="input-group date">\n    \t\t\t\t\t\t\t\t<input type="text" class="form-control form-control-sm datatable-input" readonly placeholder="From" id="kt_datepicker_1"\n    \t\t\t\t\t\t\t\t data-col-index="'+n.index()+'"/>\n    \t\t\t\t\t\t\t\t<div class="input-group-append">\n    \t\t\t\t\t\t\t\t\t<span class="input-group-text"><i class="la la-calendar-o glyphicon-th"></i></span>\n    \t\t\t\t\t\t\t\t</div>\n    \t\t\t\t\t\t\t</div>\n    \t\t\t\t\t\t\t<div class="input-group date d-flex align-content-center">\n    \t\t\t\t\t\t\t\t<input type="text" class="form-control form-control-sm datatable-input" readonly placeholder="To" id="kt_datepicker_2"\n    \t\t\t\t\t\t\t\t data-col-index="'+n.index()+'"/>\n    \t\t\t\t\t\t\t\t<div class="input-group-append">\n    \t\t\t\t\t\t\t\t\t<span class="input-group-text"><i class="la la-calendar-o glyphicon-th"></i></span>\n    \t\t\t\t\t\t\t\t</div>\n    \t\t\t\t\t\t\t</div>');break;case"Actions":var i=$('\n                                <button class="btn btn-primary kt-btn btn-sm kt-btn--icon d-block">\n\t\t\t\t\t\t\t        <span>\n\t\t\t\t\t\t\t            <i class="la la-search"></i>\n\t\t\t\t\t\t\t            <span>Search</span>\n\t\t\t\t\t\t\t        </span>\n\t\t\t\t\t\t\t    </button>'),s=$('\n                                <button class="btn btn-secondary kt-btn btn-sm kt-btn--icon">\n\t\t\t\t\t\t\t        <span>\n\t\t\t\t\t\t\t           <i class="la la-close"></i>\n\t\t\t\t\t\t\t           <span>Reset</span>\n\t\t\t\t\t\t\t        </span>\n\t\t\t\t\t\t\t    </button>');$("<th>").append(i).append(s).appendTo(e),$(i).on("click",(function(a){a.preventDefault();var n={};$(e).find(".datatable-input").each((function(){var t=$(this).data("col-index");n[t]?n[t]+="|"+$(this).val():n[t]=$(this).val()})),$.each(n,(function(a,e){t.column(a).search(e||"",!1,!1)})),t.table().draw()})),$(s).on("click",(function(a){a.preventDefault(),$(e).find(".datatable-input").each((function(a){$(this).val(""),t.column($(this).data("col-index")).search("",!1,!1)})),t.table().draw()}))}"Actions"!==n.title()&&$(a).appendTo($("<th>").appendTo(e))}));var n=function(){a.api().columns().every((function(){var t=this;t.responsiveHidden()?$(e).find("th").eq(t.index()).show():$(e).find("th").eq(t.index()).hide()}))};n(),window.onresize=n,$("#kt_datepicker_1,#kt_datepicker_2").datepicker()},columnDefs:[{targets:-1,title:"Actions",orderable:!1,render:function(t,a,e,n){return'\t\t\t\t\t\t\t<div class="dropdown dropdown-inline">\t\t\t\t\t\t\t\t<a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">\t                                <i class="la la-cog"></i>\t                            </a>\t\t\t\t\t\t\t  \t<div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">\t\t\t\t\t\t\t\t\t<ul class="nav nav-hoverable flex-column">\t\t\t\t\t\t\t    \t\t<li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-edit"></i><span class="nav-text">Edit Details</span></a></li>\t\t\t\t\t\t\t    \t\t<li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-leaf"></i><span class="nav-text">Update Status</span></a></li>\t\t\t\t\t\t\t    \t\t<li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-print"></i><span class="nav-text">Print</span></a></li>\t\t\t\t\t\t\t\t\t</ul>\t\t\t\t\t\t\t  \t</div>\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t<a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Edit details">\t\t\t\t\t\t\t\t<i class="la la-edit"></i>\t\t\t\t\t\t\t</a>\t\t\t\t\t\t\t<a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Delete">\t\t\t\t\t\t\t\t<i class="la la-trash"></i>\t\t\t\t\t\t\t</a>\t\t\t\t\t\t'}},{targets:5,width:"150px"},{targets:6,width:"100px",render:function(t,a,e,n){var l={1:{title:"Pending",class:"label-light-primary"},2:{title:"Delivered",class:" label-light-danger"},3:{title:"Canceled",class:" label-light-primary"},4:{title:"Success",class:" label-light-success"},5:{title:"Info",class:" label-light-info"},6:{title:"Danger",class:" label-light-danger"},7:{title:"Warning",class:" label-light-warning"}};return void 0===l[t]?t:'<span class="label label-lg font-weight-bold'+l[t].class+' label-inline">'+l[t].title+"</span>"}},{targets:7,width:"100px",render:function(t,a,e,n){var l={1:{title:"Online",state:"danger"},2:{title:"Retail",state:"primary"},3:{title:"Direct",state:"success"}};return void 0===l[t]?t:'<span class="label label-'+l[t].state+' label-dot mr-2"></span><span class="font-weight-bold text-'+l[t].state+'">'+l[t].title+"</span>"}}]})}}}();jQuery(document).ready((function(){KTDatatablesSearchOptionsColumnSearch.init()}));