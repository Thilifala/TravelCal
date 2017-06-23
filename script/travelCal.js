
var tempHTML={
	txtPerInput:'<div>\
					<input type="text" class="txtPer">\
					<div class="btnDelPer"></div>\
				</div>',
	trAccount:'<tr>\
					<td align="center"><input type="text" class="txt_item"></td>\
					<td align="center"><input type="number" min="0" step="0.01" class="txt_account"></td>\
					<td align="center" class="tdselect td_paidpeople"></td>\
					<td align="center" class="tdselect td_paidfor"></td>\
				</tr>',
	trCalRes:'<tr>\
				<td align="center">{0}</td>\
				<td align="center">{1}</td>\
			</tr>',
	liPopupWin:'<li>{0}</li>'
}

String.prototype.format=function(){
	var s = this;
	for(var i=0;i<arguments.length;i++){
		var regExp=new RegExp("\\{"+i+"\\}","g");
		s = s.replace(regExp,arguments[i]);
	}
	return s;
}

//参与人
var Participant = function(name){
	this.name = name || '';
	this.shouldGet=0;
	this.shouldPay=0;
}
//付费项目
var APaidItem = function(itemName,account){
	this.itemName = itemName || '';
	this.account = account || 0;
	this.paidpeople = {};
	this.payfor = [];
}
APaidItem.prototype.setAccont=function(account){
	this.account = parseFloat(account);
}

//视图
var view={
	pgToggle:function(pgId){
		$('.pgBox#' + pgId).show();
		$('.pgBox:not(#'+pgId+')').hide();
	},

	addPer:function(box){
		$(box).append(tempHTML.txtPerInput);
	},

	//表格视图操作
	addAccountRow:function(box){
		var $trAccount = $(tempHTML.trAccount);
		$trAccount.data('paidItem',new APaidItem());
		$(box).append($trAccount);
	},
	updatePaidPerple:function(){
		var paidItem = $(this).parents('tr').data('paidItem');
		var name = paidItem.paidpeople.name;
		$(this).empty().append(name);
	},
	updatePayfor:function(){
		var paidItem = $(this).parents('tr').data('paidItem');
		var names = [];
		$(paidItem.payfor).each(function(i,el){
			names.push(el.name);
		})
		$(this).empty().append(names.join(','));
	},
	
	//弹窗视图
	popupWin:function(isMutiSelect){
		$('.popupwin ul').empty();
		$(model.participant).each(function(i,e){
			var $liDom = $(tempHTML.liPopupWin.format(e.name));
			$liDom.data('participant',e);
			$('.popupwin ul').append($liDom);
		});

		if(isMutiSelect){
			$('.popupwin').addClass('multiSelect');
			$('.popupwin .btnSelectOK').show();
		}
		else{
			$('.popupwin').removeClass('multiSelect');
			$('.popupwin .btnSelectOK').hide();
		}

		$('.cover').show();
		$('.popupwin').show();
	},
	hidePopupWin:function(){
		$('.cover').hide();
		$('.popupwin').hide();
	},

	showCalResult:function(){
		var p = model.participant;
		$('#tbCalRes tbody').empty();
		$(p).each(function(i,e){
			var trHtml = tempHTML.trCalRes.format(e.name,e.shouldGet-e.shouldPay);
			$('#tbCalRes tbody').append(trHtml);
		})
		$('#tbCalRes').show();
	}
}

//模型
var model={
	participant:[],
	setPaidItemVal:function(prop,pval){
		var $this = $(this);
		var $row = $this.parents('tr');
		var val = pval || $this.val();
		var data = $row.data('paidItem');

		if(typeof data[prop] == 'function'){
			data[prop](val);
		}
		else{
			data[prop] = val;
		}

		$row.data('paidItem',data);
	}
}


var eventBind = function(){
	// 参与人页面
	$('.btnAddPer').on('click',function(){
		//TODO: 弹窗输入人，且在model.participant加上此人
		view.addPer($('.box-participant'));
	});

	$('.btnAddPerOK').on('click',function(){
		//循环遍历所有参与人，并加到model中
		model.participant = new Array();
		$('.box-participant .txtPer').each(function(i,e){
			var perName = $(e).val();
			perName && model.participant.push(new Participant(perName));
		})
		if(model.participant.length==0){
			alert('亲~要先输入参与人哦');
			return;
		}
		view.pgToggle('pg-account');
	});

	$('.box-participant').delegate('.btnDelPer','click',function(){
		//TODO: 检查该人是否被使用，model.participant除去该人
		$(this).parent().remove();
	});

	// 消费页面
	$('.btnBack').on('click',function(){
		view.pgToggle('pg-per');
		// $('#tbCalRes').hide();
	})

	$('.btnAddRow').on('click',function(){
		view.addAccountRow($('#tbAccount tbody'));
	})

	$('.btnDelRow').on('click',function(){

	})

	$('#tbAccount').delegate('.tdselect','click',function(){
		$('#tbAccount td').removeClass('active');
		$(this).addClass('active');
		var isMutiSelect = $(this).hasClass('td_paidfor');
		//弹窗单选人
		view.popupWin.call(this,isMutiSelect);
	})

	$('#tbAccount').delegate('.txt_account','change',function(){
		model.setPaidItemVal.call(this,'setAccont');
	})

	$('#tbAccount').delegate('.txt_item','change',function(){
		model.setPaidItemVal.call(this,'itemName');
	})

	//弹窗选人事件
	$('.popupwin ul').delegate('li','click',function(){
		if($(this).hasClass('active')){
			$(this).removeClass('active');
		}
		else{
			$(this).addClass('active');
		}
		var isMutiSelect = $('.popupwin').hasClass('multiSelect');;
		if(!isMutiSelect){
			setTimeout(()=>{
				var $td = $('#tbAccount .active');
				var participant = $(this).data('participant');
				model.setPaidItemVal.call($td,'paidpeople',participant);
				view.updatePaidPerple.call($td);
				view.hidePopupWin();
			},200);
		}
	})
	$('.popupwin .btnSelectOK').on('click',function(){
		var selPers = [];
		$('.popupwin li.active').each(function(i,el){
			var oPer = $(el).data('participant');
			selPers.push(oPer);
		})

		var $td = $('#tbAccount .active');
		model.setPaidItemVal.call($td,'payfor',selPers);
		view.updatePayfor.call($td);
		view.hidePopupWin();
	})

	$('.btnCalculate').on('click',function(){
		$(model.participant).each(function(i,e){
			e.shouldPay=0;
			e.shouldGet=0;
		})
		$('#tbAccount tbody tr').each(function(i,tr){
			var paidItem = $(tr).data('paidItem');
			var avgAcount = parseFloat((paidItem.account / paidItem.payfor.length).toFixed(2));
			paidItem.paidpeople.shouldGet += paidItem.account;
			$(paidItem.payfor).each(function(i,forPer){
				forPer.shouldPay += avgAcount;
			}) 
		})
		view.showCalResult();
	})
}

$().ready(function(){
	eventBind();
})