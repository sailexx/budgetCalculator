// Budge Controller Module
var budgetController = (function() {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        };
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };


    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            
            sum  += cur.value;   
        });
        data.totals[type] = sum
    };


    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            inc : 0,
            exp : 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem : function (type, des,val) {
            var newItem, ID;
            //create ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;     
            };
            //create new item based on inc or exp
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            };
            // Save the new item on the inc or exp array
            data.allItems[type].push(newItem);        
            return newItem;
        },
        

        delectItem : function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id
            });
            index = ids.indexOf(id)

            if(index !== -1){
                data.allItems[type].splice(index,1)
            };
        },


        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')
            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the persentage of income that we spent
            if (data.totals.inc > 0 ) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
            }else {
                data.percentage = -1;
            };
        },


        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function(){
            var allPerc;
            allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        },


        testing:function(){
            console.log(data)
        },


    };
})();




// User Interface Controller module
var UIController = (function() {
    var DOMStrings = {
        DOMtype: '.add__type',
        DOMdescription: '.add__description',
        DOMvalue: '.add__value',
        DOMbtn: '.add__btn',
        DOMExpenseList : '.expenses__list',
        DOMIncomeList : '.income__list',
        DOMBudget : '.budget__value',
        DOMExp:'.budget__expenses--value',
        DOMInc:'.budget__income--value',
        DOMPercentage:'.budget__expenses--percentage',
        DOMContainer : '.container',
        DOMExpPercLabel : '.item__percentage',
        DOMDateLabel : '.budget__title--month'    
    };

    var nodeListforEach = function(fields, callback){
        for(i=0; i < fields.length; i++){
            callback(fields[i], i)
        };

    };
    var formattingNum = function(num, type){
        var num, numSplit, int, dec;
        //To Do List
        //2. add 2 point decimal number eg 2000 -> 2000.00
        num = Math.abs(num);
        num = num.toFixed(2);
        //3. add "," comma in place of thousand.
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3 ){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        //1. show + for income and - for exp.
        type === 'exp'? sign = '-' : sign = '+';
        return sign + ' ' + int + '.' + dec; 
    };


    return{
        displayBudget: function(obj){
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.DOMBudget).textContent = formattingNum(obj.budget, type)
            document.querySelector(DOMStrings.DOMExp).textContent = formattingNum(obj.totalExp, 'exp')
            document.querySelector(DOMStrings.DOMInc).textContent = formattingNum(obj.totalInc, 'inc')
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.DOMPercentage).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.DOMPercentage).textContent = '--'
            }           
        },




        getInput : function(){
            return{
                type: document.querySelector(DOMStrings.DOMtype).value,
                description : document.querySelector(DOMStrings.DOMdescription).value,
                value : parseFloat(document.querySelector(DOMStrings.DOMvalue).value)
            };
        },


        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.DOMIncomeList;         
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.DOMExpenseList;              
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            };     
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formattingNum(obj.value, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },


    
        delectItemList: function(selectorID){
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },


        displayPrecentages: function(perc){
            var fields = document.querySelectorAll(DOMStrings.DOMExpPercLabel);

            nodeListforEach(fields, function(current, index){
                if(perc[index] !== 0 ){    
                    current.textContent = perc[index] + '%';
                }else{
                    current.textContent = '---';
                };
            });
        },
        displayDate: function(d){

            var now = new Date()
            month = now.getMonth()
            months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'Sepember', 'October', 'November', 'December'];
            year = now.getFullYear();
            document.querySelector(DOMStrings.DOMDateLabel).textContent = months[month] + ' ' + year;
            
        },

        changeType: function(){
            var field = document.querySelectorAll(
                DOMStrings.DOMtype + ',' + 
                DOMStrings.DOMdescription + ',' + 
                DOMStrings.DOMvalue);
            console.log(field)
            nodeListforEach(field, function(curr){
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.DOMbtn).classList.toggle('red-focus');
        },


        clearField: function() {
            var field, fieldArr;
            field = document.querySelectorAll(DOMStrings.DOMdescription + ', ' + DOMStrings.DOMvalue) // return a list
            //convert into a array this process trick list as an array so we can slice it
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(function(current, index, array) {
                current.value = ""; 
            });
            fieldArr[0].focus();
        },
    

        getDOMstrings : function(){
            return DOMStrings;
        }
    };
})();




//GLOBEL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListener = function(){
        document.querySelector(DOM.DOMbtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13 ){
                ctrlAddItem();
            };   
        document.querySelector(DOM.DOMContainer).addEventListener('click', ctrlDelectItem);

        document.querySelector(DOM.DOMtype).addEventListener('change', UICtrl.changeType);

        } );
    };
    var DOM = UICtrl.getDOMstrings();


    var updateBudget = function(){   
        //Calculate the budget
        budgetCtrl.calculateBudget();
        //return the budget
        var budget = budgetCtrl.getBudget();
        //Display the budget on UI
        UICtrl.displayBudget(budget);
    };

    updatePrecentages = function(){
        //calculate the percentage
        budgetCtrl.calculatePercentages();
        //read from budget controller
        var percentages = budgetCtrl.getPercentages();
        // Update the UI with new percentages
        UICtrl.displayPrecentages(percentages);
    };


    var ctrlDelectItem = function(event){
        var itemID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID){
            splitID = itemID.split('-');
            ID = parseInt(splitID[1]);
            type = splitID[0];
           //delect the data from budget controller 
            budgetCtrl.delectItem(type, ID);
           // remove the UI
            UICtrl.delectItemList(itemID);
           //Update the budget
            updateBudget();
             //uodate percentages
            updatePrecentages();
        };
    }


    var ctrlAddItem = function(){
        //Get input data
        var Input = UICtrl.getInput();
        if (Input.description !== "" && !isNaN(Input.value) && Input.value !== 0){
            //Add item to budget controller
            var newItem = budgetController.addItem(Input.type, Input.description, Input.value);
            //Add item to UI
            UICtrl.addListItem(newItem, Input.type);
            //for clearing input field
            UICtrl.clearField();
            // calculate and update budget
            updateBudget();
            //uodate percentages
            updatePrecentages();
        };
    };


    return {
        init : function(){
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage :-1
            });
            setupEventListener();
            UICtrl.displayDate();
        }
    };

})(budgetController,UIController);


// main program
controller.init();