const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
var up = false
var down = false
var right = false
var left = false
var page = 'main'
var step = 1
var roll = undefined
var moveItem = false
var movingItem = undefined
var mousex = 0
var mousey = 0
var swap = false
var enteringDungeon = false
var time = 0
var room = 0
function Roll(dice, min=true){
    var a = 1
    var total = 0
    const rolls = []
    while (a<=dice){
        var die = Math.round(Math.random()*5)+1
        rolls.push(die)
        a+=1
        total += die
    }
    if (min == true){
        var min = Math.min(rolls[0],rolls[1],rolls[2],rolls[3])
        total -= min
    }
    return {total, rolls}
}
var strength = 0
var intelligence = 0
var dexterity = 0
var constitution = 0
var wisdom = 0
var perception = 0
var charisma = 0
var hp = 0
var max_hp = 1
var gold = 100
var shopImg = undefined
var daggerImg = undefined
var sharpswordImg = undefined
var manImg = undefined
var speechImg = undefined
var moneyImg = undefined
var fistImg = undefined
var pathImg = undefined
const playerImg = new Image()
playerImg.src = 'hero.png'
setTimeout(() => {shopImg = new Image(); shopImg.src = 'shop.png'},100)
setTimeout(() => {daggerImg = new Image(); daggerImg.src = 'dagger.png'},200)
setTimeout(() => {sharpswordImg = new Image(); sharpswordImg.src = 'sharpsword.png'},300)
setTimeout(() => {manImg = new Image(); manImg.src = 'man.png'}, 400)
setTimeout(() => {speechImg = new Image(); speechImg.src = 'chat.png'}, 500)
setTimeout(() => {moneyImg = new Image(); moneyImg.src = 'money-bag.png'}, 600)
setTimeout(() => {fistImg = new Image(); fistImg.src = 'fist.png'}, 700)
setTimeout(() => {pathImg = new Image(); pathImg.src = 'path.png'}, 800)
class CollisionBorder{
    constructor(x,y,width,height){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    collide(){
        if(player.x<=this.x+this.width && player.x+90>=this.x && player.y<=this.height+this.y && player.y+90>=this.y){
            return true
        }
    }
}
class InteractBorder{
    constructor(x,y,width,height){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
    collide(){
        if(player.x-20<=this.x+this.width && player.x+110>=this.x && player.y-20<=this.height+this.y && player.y+110>=this.y){
            ctx.fillStyle = '#000000'
            ctx.font = "24px Arial"
            ctx.fillText("e", player.x+40, player.y-20)
            return true
        }
    }
}
var collisionBorders = [new CollisionBorder(5,300,200,200), new CollisionBorder(915,0,90,125)]
var interactBorders = [new InteractBorder(5,300,200,200)]
class Player{
    constructor(x, y){
        this.x = x
        this.y = y
        this.time = 0
    }

    blit(){
        ctx.drawImage(playerImg, this.x, this.y)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(5,5,200,25)
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(5,5,(hp/max_hp)*200,25)
        ctx.fillStyle = '#ffffff'
        ctx.font = '17px Arial'
        ctx.fillText(Math.ceil(hp)+"/"+max_hp, 215, 25)
        if (enteringDungeon==false){
            if (up == true){this.y -= 10}
            if (down == true){this.y += 10}
            if (right == true){this.x += 10}
            if (left == true){this.x -= 10}
        }
        else{
            var dist_x = 915-this.x
            var sum = Math.pow(dist_x, 2)+Math.pow(this.y,2)
            var dist = Math.sqrt(sum)
            var x_move = (dist_x/dist)
            var y_move = (this.y/dist)
            this.x += x_move
            this.y -= y_move
            if (dist<=1){
                this.time += 0.5
                if(this.time>40){
                    page = 'dungeon'
                    room = 1
                    enteringDungeon = false
                    this.x = 915
                    this.y = 620
                }
            }
        }
        var collision = collisionBorders.find((c) => c.collide())
        if (collision != undefined){
            if (collision.height == 125){
                if (page == 'main'){enteringDungeon = true}
            }
            else{
                player.x -= 10
                collision = collisionBorders.find((c) => c.collide())
                if (collision != undefined){
                    player.x+=20
                    collision = collisionBorders.find((c) => c.collide())
                    if(collision != undefined){
                        player.x-=10
                        player.y-=10
                        collision = collisionBorders.find((c) => c.collide())
                        if(collision!=undefined){
                            player.y+=20
                        }
                    }
                }
            }
        }
        var x = 0
        var y1 = 0
        var y2 = 0
        if(page == 'dungeon'){
            x = 650
            y1 = 150
            y2 = 340
            if(this.y>=640 && room == 1){
                page = 'main'
                this.x = 915
                this.y = 150
                x=0
                y1=0
                y2=0
            }
        }
        if (this.x<0+x){
            this.x += 10
        }
        if (this.x>1820-x){
            this.x -= 10
        }
        if (this.y<-10+y1){
            this.y += 10
        }
        if (this.y>980-y2){
            this.y -= 10
        }
        ctx.fillStyle = '#000000'
        ctx.fillRect(0,0,1920,this.time*20)
        ctx.fillRect(0,1080-this.time*20,1920,1080)
        ctx.fillRect(0,0,this.time*20*1.777,1080)
        ctx.fillRect(1920-this.time*20*1.777,0,1920,1080)
        if(this.time>0 && enteringDungeon == false){
            this.time-=0.5
        }
    }
}
class Button{
    constructor(x, y, width, height, text, fontsize){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = '#0000ff'
        this.color2 = '#000069'
        this.time = 5
        this.x2 = width/10
        this.y2 = height/10
        this.font = fontsize+"px Arial"
        this.text = text
    }

    wasClicked(e){
        const { pageX: x, pageY: y } = e
        if ( (x >= this.x + 10 && x <= this.x + 10 + this.width) && (y >= this.y + 10 && y <= this.y + 10 + this.height) ){
            this.time = 0
            return true
        }
    }

    blit(){
        ctx.fillStyle = this.color2
        ctx.fillRect(this.x, this.y, this.width*1.1, this.height*1.1)
        ctx.font = this.font
        const width = ctx.measureText(this.text).width
        const height = parseInt(ctx.font.match(/\d+/), 10)
        if (this.time<5){
            this.time += 1
            ctx.fillStyle = this.color
            ctx.fillRect(this.x+this.x2, this.y+this.y2, this.width, this.height)
            ctx.fillStyle = '#000000'
            ctx.fillText(this.text, this.x + this.width/2 - width/2 + this.x2, this.y + this.height/2 + height/4 + this.y2 + 2)
        }
        else{
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
            ctx.fillStyle = '#000000'
            ctx.fillText(this.text, this.x + this.width/2 - width/2, this.y + this.height/2 + height/4 + 2)
        }
    }
}
class DroppedItem{
    constructor(x,y,item){
        this.x = x
        this.y = y
        this.item = item
        this.interact = new InteractBorder(x,y,30,30)
    }

    blit(){
        ctx.drawImage(this.item, this.x, this.y, 30, 30)
    }
}
const droppedItems = []
class Item{
    constructor(img, slot){
        this.img = img
        this.slotY = 0
        if (slot != 'weapon slot'){
            this.slotX = slot
            this.slot = slot
            while (this.slotX>5){
                this.slotY += 1
                this.slotX -= 6
            }
        }
        else{
            this.slot = 'weapon slot'
        }
    }

    wasClicked(e){
        const {pageX: x, pageY: y} = e
        if (this.slot != 'weapon slot'){
            if (x>=this.slotX*90+400 && x<=this.slotX*90+490 && y>=this.slotY*90+100 && y<=this.slotY*90+190){
                return true
            }
        }
        else{
            if (x>=1390 && x<=1480 && y>=100 && y<=190){
                return true
            }
        }
    }
}
class Backpack{
    constructor(){
        this.items = []
    }

    blit(){
        for (let i=0; i<7; i++){
            ctx.fillSyle = '#000000'
            ctx.beginPath()
            ctx.moveTo(400+i*90,100)
            ctx.lineTo(400+i*90, 640)
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(400,100+i*90)
            ctx.lineTo(940,100+i*90)
            ctx.stroke()
        }
        ctx.beginPath()
        ctx.moveTo(940,100)
        ctx.lineTo(1480,100)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(940,640)
        ctx.lineTo(1480,640)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(1480,100)
        ctx.lineTo(1480,640)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(1390,100)
        ctx.lineTo(1390,190)
        ctx.lineTo(1480,190)
        ctx.stroke()
        ctx.drawImage(fistImg, 1390, 100)
        for (let i=0; i<this.items.length; i++){
            if (this.items[i].slot != 'weapon slot'){ctx.drawImage(this.items[i].img, this.items[i].slotX*90+400, this.items[i].slotY*90+100)}
            else{
                ctx.fillStyle = '#007d00'
                ctx.fillRect(1391,101,88,88)
                ctx.drawImage(this.items[i].img, 1390, 100)
            }
        }
    }
}
const backpack = new Backpack()
const backButton = new Button(923,660,66,25, 'Back', 24)
const shopButtons = [new Button(923,660,66,25, 'Back', 24)]
const statButtons = [new Button(250,500,150,25,'Strength',24), new Button(450,500,150,25,'Intelligence',24), new Button(650,500,150,25,'Dexterity',24), new Button(850,500,150,25,'Constitution',24), new Button(1050,500,150,25,'Wisdom',24), new Button(1250,500,150,25,'Perception',24), new Button(1450,500,150,25,'Charisma',24)]
const nextButton = new Button(923,460,66,25,'Next',24)
const startButtons = [new Button(905, 440, 100, 25, 'Play', 24), new Button(905, 480, 150, 25, 'Instructions', 24)]
const instructButton = new Button(923,660,66,25,'Back',24)
const mainButtons = [new Button(300,5,66,25, 'Menu', 24), new Button(400,5,110,25,"Backpack",24)]
const menuButtons = [new Button(905,400,100,25, 'Resume', 24), new Button(905,435,100,25, 'Settings', 24)]
const optionButtons = [new Button(923,660,66,25, 'Back', 24)]
var player = new Player(910,490)
class Text{
    constructor(x,y,text){
        this.x = x
        this.y = y
        this.text = text
        ctx.fillStyle = '#000000'
        ctx.font = '30px Arial'
        this.width = ctx.measureText(text).width
    }

    blit(){
        ctx.fillText(this.text, this.x-this.width/2, this.y)
    }
}
class ShopItem{
    constructor(item,x,y,dmg,cost,name){
        this.item = item
        this.x = x
        this.y = y
        this.cost = cost
        this.text1 = new Text(x+67.5,y+105,"Damage -- "+dmg)
        this.text2 = new Text(x+67.5, y+130,"Cost -- "+cost)
        this.button = new Button(x,y+150,90,25,"Buy", 24)
        this.text3 = new Text(x+67.5, y-20, name)
    }

    blit(){
        ctx.drawImage(this.item,this.x,this.y)
        this.text1.blit()
        this.text2.blit()
        this.text3.blit()
        this.button.blit()

    }
}
function Slots(e){
    if (e.pageX>=1390 && e.pageX<=1480 && e.pageY<=190 && e.pageY>=100){
        return 'equip'
    }
    for (let i=0; i<6; i++){
        for (let k=0; k<6; k++){
            if (e.pageX>=k*90+400 && e.pageX<=k*90+490 && e.pageY>=i*90+100 && e.pageY<=i*90+190){
                sum = k+i*6
                return sum
            }
        }
    }
    return false
}
var shopItems = []
class Room{
    constructor(){}
}
setTimeout(() => {shopItems = [new ShopItem(daggerImg,100,100,"1-6",5,"Dagger"), new ShopItem(sharpswordImg, 300, 100, "1-10", 10, "Sharp Sword")]}, 1500)
var rooms = [undefined,new Room()]
var statText = undefined
function update(){
    ctx.fillStyle = '#007d00'
    ctx.fillRect(0,0,1920,1080)
    if (page == 'start'){
        ctx.font = "48px Arial"
        ctx.fillStyle = '#000000'
        let width = ctx.measureText("WELCOME TO DUNGEON ADVENTURE!").width
        ctx.fillText("WELCOME TO DUNGEON ADVENTURE!", 960-width/2, 100)
        for (let i=0; i<startButtons.length; i++){
            startButtons[i].blit()
        }
    }
    if (page == 'instructions'){
        ctx.fillStyle = '#c9c9c9'
        ctx.fillRect(660,390,600,300)
        instructButton.blit()
    }
    if (page == 'character creation'){
        if (step == 1){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("Before we begin let's create your character").width
            ctx.fillText("Before we begin let's create your character", 960-width/2, 100)
            nextButton.blit()
        }
        if (step == 2){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("First we will roll for your starting attributes").width
            ctx.fillText("First we will roll for your starting attributes", 960-width/2, 100)
            width = ctx.measureText("To do this we will roll 4 6-sided dice, then add the 3 highest values for each attribute").width
            ctx.fillText("To do this we will roll 4 6-sided dice, then add the 3 highest values for each attribute", 960-width/2, 150)
            nextButton.blit()
        }
        if (step == 3){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("You roll "+roll.rolls).width
            ctx.fillText("You rolled a "+roll.rolls, 960-width/2, 100)
            width = ctx.measureText("So the 3 highest values added together is "+roll.total).width
            ctx.fillText("So the 3 highest values added together is "+roll.total, 960-width/2, 150)
            width = ctx.measureText("Where would you like to assign your value of "+roll.total).width
            ctx.fillText("Where would you like to assign your value of "+roll.total+"?", 960-width/2, 200)
            for (let i=0; i<statButtons.length; i++){
                statButtons[i].blit()
            }
        }
        if (step == 4){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("Next we will determine for your starting hit-points").width
            ctx.fillText("Next we will determine for your starting hit-points", 960-width/2, 100)
            width = ctx.measureText("To do this we will take your constitution, multiply it by 2, then add the sum of 3 6-sided dice").width
            ctx.fillText("To do this we will take your constitution, multiply it by 2, then add the sum of 3 6-sided dice", 960-width/2, 150)
            nextButton.blit()
        }
        if (step == 5){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("Rolling the dice you get "+roll.rolls+" for a total of "+roll.total).width
            ctx.fillText("Rolling the dice you get "+roll.rolls+" for a total of "+roll.total, 960-width/2, 100)
            width = ctx.measureText("Your constitution("+constitution+")x2 adds to a total of "+constitution*2).width
            ctx.fillText("Your constitution("+constitution+")x2 adds to a total of "+constitution*2, 960-width/2, 150)
            width = ctx.measureText("So your starting hit-points are "+hp+"("+roll.total+"+"+constitution*2+")").width
            ctx.fillText("So your starting hit-points are "+hp+"("+roll.total+"+"+constitution*2+")", 960-width/2, 200)
            nextButton.blit()
        }
        if (step == 6){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("Next we will determine for your starting gold").width
            ctx.fillText("Next we will determine for your starting gold", 960-width/2, 100)
            width = ctx.measureText("To do this we will roll and add 20 6-sided dice").width
            ctx.fillText("To do this we will roll and add 20 6-sided dice", 960-width/2, 150)
            nextButton.blit()
        }
        if (step == 7){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("Rolling for your gold you got a starting amount of "+gold+" gold").width
            ctx.fillText("Rolling for your gold you got a starting amount of "+gold+" gold", 960-width/2, 100)
            nextButton.blit()
        }
        if (step == 8){
            ctx.fillStyle = '#000000'
            ctx.font = '30px Arial'
            let width = ctx.measureText("Congratulations! You have finished creating your character!").width
            ctx.fillText("Congratulations! You have finished creating your character!", 960-width/2, 100)
            width = ctx.measureText("Your stats:").width
            ctx.fillText("Your stats:", 960-width/2, 150)
            for (let i=0; i<statText.length; i++){
                statText[i].blit()
            }
            nextButton.blit()
        }
    }
    if (page == 'main'){
        ctx.fillStyle = '#000000'
        ctx.font = '24px Arial'
        ctx.fillText("Gold -- "+gold,5,75)
        try{
            ctx.drawImage(pathImg, 885, 0)
            ctx.drawImage(pathImg, 885, 200)
            ctx.fillStyle = '#000000'
            ctx.beginPath()
            ctx.arc(960,75,75,0,Math.PI*2,false)
            ctx.fill()
            ctx.stroke()
            ctx.drawImage(shopImg, 5, 300)
            ctx.drawImage(manImg, 80,440)
            ctx.drawImage(speechImg, 115, 400)
            ctx.drawImage(moneyImg, 118, 403)
        }
        catch{}
        var interact = interactBorders.find((i) => i.collide())
        for (let i=0; i<mainButtons.length; i++){
            mainButtons[i].blit()
        }
        try{
            player.blit()
        }
        catch{}
    }
    if (page == 'menu'){
        ctx.fillStyle = '#c9c9c9'
        ctx.fillRect(885,390,150,300)
        for (let i=0; i<menuButtons.length; i++){
            menuButtons[i].blit()
        }
    }
    if (page == 'settings'){
        ctx.fillStyle = '#c9c9c9'
        ctx.fillRect(660,390,600,300)
        for (let i=0; i<optionButtons.length; i++){
            optionButtons[i].blit()
        }
    }
    if (page == 'shop'){
        for (let i=0; i<shopButtons.length; i++){
            shopButtons[i].blit()
        }
        for (let i=0; i<shopItems.length; i++){
            shopItems[i].blit()
        }
    }
    if (page == 'inventory'){
        backButton.blit()
        backpack.blit()
        if (moveItem == true){
            window.addEventListener('mousemove', function(e){
                mousex = e.pageX
                mousey = e.pageY
            })
            ctx.drawImage(movingItem.img, mousex-45, mousey-45)
        }
    }
    if (page == 'dungeon'){
        ctx.fillStyle = '#000000'
        ctx.fillRect(0,0,1920,1080)
        ctx.fillStyle = '#c9c9c9'
        ctx.fillRect(660,140,600,600)
        var interact = interactBorders.find((i) => i.collide())
        for (let i=0; i<mainButtons.length; i++){
            mainButtons[i].blit()
        }
        for (let i=0; i<droppedItems.length; i++){
            droppedItems[i].blit()
            droppedItems[i].interact.collide()
        }
        ctx.fillStyle = '#ffffff'
        ctx.font = '24px Arial'
        ctx.fillText("Gold -- "+gold,5,75)
        player.blit()
    }
    requestAnimationFrame(update)
}
update()
window.addEventListener('keydown', function(e){
    if(enteringDungeon==false){
        if (e.key == 'w'){up = true}
        if (e.key == 's'){down = true}
        if (e.key == 'd'){right = true}
        if (e.key == 'a'){left = true}
        if (e.key == 'e'){
            var interact = interactBorders.find((i) => i.collide())
            if (interact != undefined){
                if(interact.x == 5 && interact.y == 300){
                    page = 'shop'
                }
            }
            const pickedUp = droppedItems.find((e) => e.interact.collide())
            if (pickedUp != undefined){
                if (pickedUp.item == daggerImg){
                    backpack.items.push(new Item(daggerImg, backpack.items.length))
                    droppedItems.splice(droppedItems.indexOf(pickedUp), 1)
                }
                if (pickedUp.item == sharpswordImg){
                    backpack.items.push(new Item(sharpswordImg, backpack.items.length))
                    droppedItems.splice(droppedItems.indexOf(pickedUp), 1)
                }
            }
        }
    }
})
window.addEventListener('keyup', function(e){
    if (e.key == 'w'){up = false}
    if (e.key == 's'){down = false}
    if (e.key == 'd'){right = false}
    if (e.key == 'a'){left = false}
})
function onClick(e){
    if (page == 'main'){
        if(enteringDungeon==false){
            const clickedButton = mainButtons.find((b) => b.wasClicked(e))
            if (clickedButton != undefined){
                if (clickedButton.text == 'Menu'){setTimeout(() => {page = 'menu'}, 250)}
                if (clickedButton.text == 'Backpack'){setTimeout(() => {page = 'inventory'}, 250)}
            }
        }
    }
    else if (page == 'menu'){
        const clickedButton = menuButtons.find((b) => b.wasClicked(e))
        if (clickedButton != undefined){
            if (clickedButton.text == 'Resume'){
                setTimeout(() => {
                    if(room == 1){page = 'dungeon'}
                    else{page = 'main'}}, 250)
            }
            if (clickedButton.text == 'Settings'){
                setTimeout(() => {page = 'settings'}, 250)
            }
        }
    }
    else if(page == 'settings'){
        const clickedButton = optionButtons.find((b) => b.wasClicked(e))
        if (clickedButton != undefined){
            if (clickedButton.text == 'Back'){
                setTimeout(() => {page = 'menu'}, 250)
            }
        }
    }
    else if(page == 'start'){
        const clickedButton = startButtons.find((b) => b.wasClicked(e))
        if (clickedButton != undefined){
            if (clickedButton.text == 'Play'){
                setTimeout(() => {page = 'character creation'}, 250)
            }
            if (clickedButton.text == 'Instructions'){
                setTimeout(() => {page = 'instructions'}, 250)
            }
        }
    }
    else if(page == 'instructions'){
        const clickedButton = instructButton.wasClicked(e)
        if (clickedButton == true){
            setTimeout(() => {page = 'start'}, 250)
        }
    }
    else if(page == 'character creation'){
        if (step == 1){
            const clickedButton = nextButton.wasClicked(e)
            if (clickedButton == true){
                setTimeout(() => {step = 2}, 250)
            }
        }
        else if (step == 2){
            const clickedButton = nextButton.wasClicked(e)
            if (clickedButton == true){
                setTimeout(() => {step = 3}, 250)
                roll = Roll(4)
            }
        }
        else if (step == 3){
            const clickedButton = statButtons.find((b) => b.wasClicked(e))
            if (clickedButton != undefined){
                if (clickedButton.text == 'Strength'){
                    setTimeout(() => {strength = roll.total}, 250)
                    let index = statButtons.indexOf(clickedButton)
                    setTimeout(() => {statButtons.splice(index, 1)}, 250)
                }
                if (clickedButton.text == 'Intelligence'){
                    setTimeout(() => {intelligence = roll.total}, 250)
                    let index = statButtons.indexOf(clickedButton)
                    setTimeout(() => {statButtons.splice(index, 1)}, 250)
                }
                if (clickedButton.text == 'Dexterity'){
                    setTimeout(() => {dexterity = roll.total}, 250)
                    let index = statButtons.indexOf(clickedButton)
                    setTimeout(() => {statButtons.splice(index, 1)}, 250)
                }
                if (clickedButton.text == 'Constitution'){
                    setTimeout(() => {constitution = roll.total}, 250)
                    let index = statButtons.indexOf(clickedButton)
                    setTimeout(() => {statButtons.splice(index, 1)}, 250)
                }
                if (clickedButton.text == 'Wisdom'){
                    setTimeout(() => {wisdom = roll.total}, 250)
                    let index = statButtons.indexOf(clickedButton)
                    setTimeout(() => {statButtons.splice(index, 1)}, 250)
                }
                if (clickedButton.text == 'Perception'){
                    setTimeout(() => {perception = roll.total}, 250)
                    let index = statButtons.indexOf(clickedButton)
                    setTimeout(() => {statButtons.splice(index, 1)}, 250)
                }
                if (clickedButton.text == 'Charisma'){
                    setTimeout(() => {charisma = roll.total}, 250)
                    let index = statButtons.indexOf(clickedButton)
                    setTimeout(() => {statButtons.splice(index, 1)}, 250)
                }
                if (statButtons.length==1){
                    setTimeout(() => {step = 4}, 250)
                    setTimeout(() => {roll = Roll(3, false)}, 250)
                    setTimeout(() => {hp = constitution*2+roll.total}, 250)
                    setTimeout(() => {max_hp = hp}, 250)
                }
                else{
                    setTimeout(() => {roll = Roll(4)}, 250)
                }
            }
        }
        else if(step == 4){
            const clickedButton = nextButton.wasClicked(e)
            if (clickedButton == true){
                setTimeout(() => {step = 5}, 250)
            }
        }
        else if(step == 5){
            const clickedButton = nextButton.wasClicked(e)
            if (clickedButton == true){
                setTimeout(() => {step = 6}, 250)
            }
        }
        else if(step == 6){
            const clickedButton = nextButton.wasClicked(e)
            if (clickedButton == true){
                setTimeout(() => {step = 7}, 250)
                setTimeout(() => {roll = Roll(20, false)}, 250)
                setTimeout(() => {gold = roll.total}, 250)
            }
        }
        else if(step == 7){
            const clickedButton = nextButton.wasClicked(e)
            if (clickedButton == true){
                setTimeout(() => {step = 8}, 250)
                setTimeout(() => {nextButton.text = 'Begin'; nextButton.y = 625}, 250)
                setTimeout(() => {statText = [new Text(960,200,"Strength -- "+strength), new Text(960,250,"Intelligence -- "+intelligence),
            new Text(960,300,"Dexterity -- "+dexterity), new Text(960,350,"Constitution -- "+constitution), new Text(960, 400, "Wisdom -- "+wisdom), new Text(960,450,"Perception -- "+perception),
        new Text(960,500,"Charisma -- "+charisma), new Text(960,550,"Gold -- "+gold), new Text(960,600,"hit-points -- "+hp+"/"+max_hp)]}, 250)
            }
        }
        else if(step == 8){
            const clickedButton = nextButton.wasClicked(e)
            if (clickedButton == true){
                setTimeout(() => {page = 'main'}, 250)
            }
        }

    }
    else if(page == 'shop'){
        const clickedButton = shopButtons.find((b) => b.wasClicked(e))
        if (clickedButton != undefined){
            setTimeout(() => {page = 'main'}, 250)
        }
        const clickedBuy = shopItems.find((b) => b.button.wasClicked(e))
        if (clickedBuy != undefined){
            if (clickedBuy.item == daggerImg){
                if (gold>=5){
                    backpack.items.push(new Item(daggerImg, backpack.items.length))
                    gold -= 5
                }
            }
            if (clickedBuy.item == sharpswordImg){
                if (gold>=10){
                    backpack.items.push(new Item(sharpswordImg, backpack.items.length))
                    gold -= 10
                }
            }
        }
    }
    else if(page == 'inventory'){
        const clickedButton = backButton.wasClicked(e)
        if (clickedButton != undefined){
            setTimeout(() => {
                if(room == 1){page = 'dungeon'}
                else{page = 'main'}}, 250)
        }
        if (moveItem == false){
            const clickedItem = backpack.items.find((i) => i.wasClicked(e))
            if (clickedItem != undefined){
                moveItem = true
                movingItem = clickedItem
                mousex = e.pageX
                mousey = e.pageY
                backpack.items.splice(backpack.items.indexOf(clickedItem), 1)
            }
        }
        else{
            const clickedSlot = Slots(e)
            if (clickedSlot == 'equip'){
                for (let i=0; i<backpack.items.length; i++){
                    if(backpack.items[i].slot == 'weapon slot'){
                        swap = true
                    }
                }
                if (swap == false){
                    backpack.items.push(new Item(movingItem.img, 'weapon slot'))
                    moveItem = false
                }
                else{
                    swap = false
                }
            }
            else if (clickedSlot != false || clickedSlot == 0){
                for (let i=0; i<backpack.items.length; i++){
                    if (backpack.items[i].slotX+backpack.items[i].slotY*6 == clickedSlot){
                        swap = true
                    }
                }
                if (swap == false){
                    backpack.items.push(new Item(movingItem.img, clickedSlot))
                    moveItem = false
                }
                else{
                    swap = false
                }
            }
        }
    }
    else if(page == 'dungeon'){
        const clickedButton = mainButtons.find((b) => b.wasClicked(e))
        if (clickedButton != undefined){
            if (clickedButton.text == 'Menu'){setTimeout(() => {page = 'menu'}, 250)}
            if (clickedButton.text == 'Backpack'){setTimeout(() => {page = 'inventory'}, 250)}
        }
    }
}
window.addEventListener('click', onClick)
