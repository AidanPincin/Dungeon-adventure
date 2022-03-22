const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
var page = 'start'
var instructionsPage = false
var inInventory = false
var inMenu = false
var inSettings = false
var step = 1
var up = false
var down = false
var right = false
var left = false
var moveX = 0
var moveY = 0
var l = 2500
var r = 2500
var room = 0
var time = 0
function drawRect(color,x,y,width,height){
    ctx.fillStyle = color
    ctx.fillRect(x,y,width,height)
}
class Character{
    constructor(){
        this.x = 550
        this.y = 350
        this.player = new Image()
        this.player.src = 'hero.png'
        this.weapon = 'fists'
    }
    blit(){
        try{
            if (up==true && this.y>0){this.y-=10}
            if (down==true && this.y<700){this.y+=10}
            if (left==true && this.x>0){this.x-=10}
            if (right==true && this.x<1100){this.x+=10}
            ctx.drawImage(this.player, this.x, this.y)
            drawRect('#ffffff',5,5,200,30)
            drawRect('#ff0000',5,5,(this.hp/this.max_hp)*200,30)
            ctx.fillStyle = '#ffffff'
            ctx.font = '24px Arial'
            ctx.fillText(this.hp+"/"+this.max_hp, 215, 29)
            ctx.fillText("Gold -- "+this.gold,5,70)
        }
        catch{this.player.src = 'hero.png'}
    }
    assign(attr, value){
        this[attr] = value
    }
}
class object{
    constructor(img,x,y,collide=false){
        this.img = new Image()
        this.img.src = img
        this.src = img
        this.x = x
        this.y = y
        this.collide = collide
    }
    draw(){
        try{ctx.drawImage(this.img, this.x, this.y)}
        catch{this.img.src = this.src}
    }
    interaction(){
        const { naturalWidth: width, naturalHeight: height } = this.img
        if (this.collide == true){
            if (character.x<=this.x+width && character.x+100>=this.x && character.y<=this.y+height && character.y+100>=this.y){
                const x_dif = character.x-this.x
                const y_dif = character.y-this.y
                if (x_dif<=-100){
                    character.x-=10
                }
                if (x_dif>=width){
                    character.x+=10
                }
                if (y_dif<=-100){
                    character.y-=10
                }
                if (y_dif>=height){
                    character.y+=10
                }
            }
        }
        if (character.x<=this.x+width+20 && character.x+120>=this.x && character.y<=this.y+height+20 && character.y+120>=this.y){
            ctx.fillStyle = '#000000'
            ctx.font = '24px Arial'
            ctx.fillText('e',character.x+38,character.y-5)
        }
    }
    wasNear(){
        const { naturalWidth: width, naturalHeight: height } = this.img
        if (character.x<=this.x+width+20 && character.x+120>=this.x && character.y<=this.y+height+20 && character.y+120>=this.y){return true}
    }
}
class Backpack{
    constructor(){
        this.items = []
        this.fist = new Image()
        this.fist.src = 'fist.png'
        this.slotCount = 25
    }
    blit(){
        drawRect('#000000',625,50,400,1)
        drawRect('#000000',625,500,400,1)
        drawRect('#000000',1025,50,1,450)
        drawRect('#000000',935,50,1,90)
        drawRect('#000000',935,140,90,1)
        try{if (character.weapon == 'fists'){ctx.drawImage(this.fist,935,50)}}
        catch{this.fist.src = 'fist.png'}
        for (let i=0; i<6; i++){
            drawRect('#000000',175,50+i*90,450,1)
            drawRect('#000000',175+i*90,50,1,450)
        }
        for (let i=0; i<this.items.length; i++){
            this.items[i].draw()
        }
    }
    addItem(img, slot){
        if (typeof slot != 'number') {
            const possibleSlots = [...Array(this.slotCount).keys()].filter(i => this.items.every(item => item.slot !== i))
            slot = Math.min(...possibleSlots)
            console.log(possibleSlots, slot)
        }
        this.items.push(new Item(img,slot))
    }
}
function getSlot(e){
    const { pageX: x, pageY: y } = e
    for (let i=0; i<5; i++){
        for (let g=0; g<5; g++){
            if (x>=185+i*90 && x<=275+i*90 && y>=60+g*90 && y<=150+g*90){
                return {'slotX':i, 'slotY':g}
            }
        }
    }
    if (x>=935 && x<=1025 && y>= 50 && y<=140){
        return {'slotX':'weapon slot', 'slotY':'weapon slot'}
    }
}
class Item{
    constructor(img,slot){
        this.img = new Image()
        this.img.src = img
        this.src = img
        this.slot = slot
        this.slotX = slot
        this.slotY = 0
        this.move = false
        this.time = 250
        while (this.slotX>4){
            this.slotX -= 5
            this.slotY += 1
        }
    }
    draw(){
        if (this.move == false){
            try{
                if (this.slotX == 'weapon slot'){ctx.drawImage(this.img,935,50)}
                else{ctx.drawImage(this.img,175+this.slotX*90,50+this.slotY*90)}
            }
            catch{this.img.src = this.src}
        }
        else{
            try{ctx.drawImage(this.img,moveX-45,moveY-45)}
            catch{this.img.src = this.src}
        }
    }
    wasClicked(e){
        const { pageX: x, pageY: y } = e
        if (this.move == true){
            const slot = getSlot(e)
            if (slot != undefined){
                this.slotX = slot.slotX
                this.slotY = slot.slotY
                if (slot.slotX == 'weapon slot'){
                    setTimeout(() => {character.weapon = this.src}, 0)
                }
                this.move = false
            }
        }
        else{
            if (this.slotX == 'weapon slot'){
                if (x>=935 && x<=1025 && y>=50 && y<=140){
                    this.move = true
                    character.weapon = 'fists'
                }
            }
            else{
                if (x>=this.slotX*90+185 && x<=this.slotX*90+275 && y>=this.slotY*90+60 && y<=this.slotY*90+150){
                    this.move = true
                }
            }
        }
    }
}
const droppedItems = []
const backpack = new Backpack()
const shop = new object('shop.png',120,250,true)
const man = new object('man.png',195,390)
const speech_bubble = new object('chat.png',225,350)
const money_bag = new object('money-bag.png',230,350)
const character = new Character()
const path = new Image()
path.src = 'path.png'
function Roll(dice, min=true){
    const rolls = []
    var total = 0
    for (let i=0; i<dice; i++){
        const die = Math.round(Math.random()*5+1)
        total += die
        rolls.push(die)
    }
    if (min==true){
        const min = Math.min(rolls[0],rolls[1],rolls[2],rolls[3])
        total -= min
    }
    return {'rolls':rolls, 'total':total}
}
class Button{
    constructor(x,y,width,height,text,size){
        this.x = x
        this.y = y
        this.text = text
        this.width = width
        this.height = height
        this.size = size
        this.font = size+"px Arial"
    }
    blit(){
        ctx.fillStyle = '#0000ff'
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = '#000000'
        ctx.font = this.font
        let width = ctx.measureText(this.text).width
        let height = this.size/3
        ctx.fillText(this.text, this.x+this.width/2-width/2, this.y+this.height/2+height)
    }
    wasClicked(e){
        const { pageX: x, pageY: y } = e
        if (x>=this.x+10 && x<=this.x+this.width+10 && y>=this.y+10 && y<=this.y+this.height+10){
            return true
        }
    }
}
class Txt{
    constructor(x,y,text,size){
        this.x = x
        this.y = y
        this.text = text
        this.height = size
        this.font = size+"px Arial"
    }
    blit(){
        ctx.fillStyle = '#000000'
        ctx.font = this.font
        let width = ctx.measureText(this.text).width
        ctx.fillText(this.text, this.x-width/2, this.y+this.height)
    }
}
class ShopItem{
    constructor(img,x,y,dmg,name,cost){
        this.img = new Image()
        this.src = img
        this.img.src = img
        this.x = x
        this.cost = cost
        this.y = y
        this.button = new Button(x,y+175,90,30,"Buy",24)
        this.dmgTxt = new Txt(x+45,y+100,"Damage -- "+dmg,24)
        this.nameTxt = new Txt(x+45,y-35,name,30)
        this.costTxt = new Txt(x+45,y+130,"Cost -- "+cost+" gold",24)
    }
    draw(){
        try{ctx.drawImage(this.img,this.x,this.y)}
        catch{this.img.src = this.src}
        this.dmgTxt.blit()
        this.nameTxt.blit()
        this.button.blit()
        this.costTxt.blit()
    }
    wasClick(e){
        const clicked = this.button.wasClicked(e)
        if (clicked == true){
            if (character.gold>=this.cost && backpack.items.length<25){
                backpack.addItem(this.src)
                character.gold -= this.cost
            }
        }
    }
}
class Room{
    constructor(north,south,west,east,northRoom=undefined,southRoom=undefined,westRoom=undefined,eastRoom=undefined){
        this.north = north
        this.west = west
        this.south = south
        this.east = east
        this.northRoom = northRoom
        this.southRoom = southRoom
        this.eastRoom = eastRoom
        this.westRoom = westRoom
    }
    draw(){
        drawRect('#7d7d7d',300,150,600,500)
        if (this.south == true){
            drawRect('#7d7d7d',550,650,100,150)
            if (character.y>=550 && (character.x<=520 || character.x>=600)){
                character.y-=10
            }
            if (character.y>=550 && character.x>=510 && character.x<=610){
                character.x = 550
            }
            if (character.y>=690){
                if (this.southRoom != 'town'){
                    room = this.southRoom
                    character.y = 150
                }
                else{
                    l -= 15
                    character.y = 700
                }
            }
        }
        else{
            if (character.y>=550){
                character.y-=10
            }
        }
        if (this.north == true){
            drawRect('#7d7d7d',550,0,100,150)
            if (character.y<=150 && (character.x<=520 || character.x>=600)){
                character.y+=10
            }
            if (character.y<=150 && character.x>=510 && character.x<=610){
                character.x = 550
            }
            if (character.y<=10){
                room = this.northRoom
                character.y = 550
            }
        }
        else{
            if (character.y<=150){
                character.y+=10
            }
        }
        if (this.west == true){
            drawRect('#7d7d7d',150,325,150,100)
            if (character.x<=300 && (character.y>=370 || character.y<=280)){
                character.x+=10
            }
            if (character.x<=300 && character.y<=380 && character.y>=270){
                character.y = 325
            }
            if (character.x<=160){
                room = this.westRoom
                character.x = 800
            }
        }
        else{
            if (character.x<=300){
                character.x+=10
            }
        }
        if (this.east == true){
            drawRect('#7d7d7d',900,325,150,100)
            if (character.x>=800 && (character.y>=370 || character.y<=280)){
                character.x-=10
            }
            if (character.x>=800 && character.y<=380 && character.y>=270){
                character.y = 325
            }
            if (character.x>=940){
                room = this.eastRoom
                character.x = 300
            }
        }
        else{
            if (character.x>=800){
                character.x-=10
            }
        }
        if (character.y>=690 && this.southRoom == 'town'){
            ctx.beginPath()
            ctx.lineWidth = 1500
            ctx.arc(600,750,l,0,Math.PI*2,false)
            ctx.stroke()
            if (l<750){
                l=750
                time += 1
                if (time>60){
                    setTimeout(() => {l=2500},0)
                    character.x = 975
                    character.y = 300
                    page = 'town'
                    time = 0
                    setTimeout(() => {r=750},0)
                }
            }
        }
    }
}
const rooms = [new Room(true,true,false,false,1,'town'), new Room(true,true,true,false,2,0,3), new Room(true,true,true,true,12,1,7,8),
new Room(false,false,true,true,undefined,undefined,4,1), new Room(true,false,true,true,6,undefined,5,3), 
new Room(false,false,false,true,undefined,undefined,undefined,4), new Room(true,true,false,true,20,4,undefined,7),
new Room(false,false,true,true,undefined,undefined,6,2), new Room(false,false,true,true,undefined,undefined,2,9),
new Room(false,true,true,true,undefined,10,8,15), new Room(true,true,false,false,9,11), 
new Room(true,false,false,false,10), new Room(true,true,false,true,37,2,undefined,13),
new Room(false,false,true,true,undefined,undefined,12,14), new Room(true,true,true,true,44,15,13,19), 
new Room(true,true,true,true,14,16,9,18), new Room(true,false,false,true,15,undefined,undefined,17),
new Room(false,false,true,false,undefined,undefined,16), new Room(false,false,true,false,undefined,undefined,15),
new Room(true,false,true,false,45,undefined,14), new Room(true,true,false,false,21,6), 
new Room(true,true,true,false,23,20,22), new Room(false,false,false,true,undefined,undefined,undefined,21),
new Room(true,true,false,false,24,21), new Room(true,true,false,true,25,23,undefined,35),
new Room(true,true,false,false,26,24), new Room(false,true,false,true,undefined,25,undefined,27),
new Room(false,false,true,true,undefined,undefined,26,28), new Room(false,true,true,false,undefined,29,27),
new Room(true,true,true,true,28,34,32,30), new Room(false,false,true,true,undefined,undefined,29,31),
new Room(false,false,true,false,undefined,undefined,30), new Room(false,false,true,true,undefined,undefined,33,29),
new Room(false,false,false,true,undefined,undefined,undefined,32), new Room(true,true,true,true,29,37,35,38),
new Room(false,true,true,true,undefined,36,24,34), new Room(true,false,false,false,35),
new Room(true,true,false,false,34,12), new Room(false,true,true,true,undefined,39,34,41), 
new Room(true,true,false,false,38,40), new Room(true,false,false,false,39),
new Room(false,true,true,true,undefined,42,38,48), new Room(true,true,false,false,41,43),
new Room(true,true,false,false,42,44), new Room(true,true,false,false,43,14),
new Room(true,true,false,false,46,19), new Room(true,true,false,false,47,45),
new Room(true,true,true,false,49,46,48), new Room(false,false,true,true,undefined,undefined,41,47),
new Room(true,true,false,false,50,47), new Room(false,true,true,true,undefined,49,52,51),
new Room(false,false,true,false,undefined,undefined,50), new Room(true,false,false,true,53,undefined,undefined,50),
new Room(true,true,true,true,57,52,58,54), new Room(true,false,true,true,56,undefined,53,55), 
new Room(false,false,true,false,undefined,undefined,54), new Room(false,true,false,false,undefined,54),
new Room(false,true,false,false,undefined,53), new Room(true,false,true,true,59,undefined,60,53),
new Room(false,true,false,false,undefined,58), new Room(true,false,false,true,61,undefined,undefined,58),
new Room(false,true,false,false,undefined,60)]
const shopItems = [new ShopItem('dagger.png',100,75,'1-6','Dagger',5), new ShopItem('sharpsword.png',300,75,'1-10','Sharp Sword',10),
new ShopItem('morningstar.png',500,75,'2-12','Morningstar',20), new ShopItem('longsword.png',100,375,'3-18','Long Sword',50), 
new ShopItem('battleaxe.png',300,375,'4-24','Battleaxe',100),new ShopItem('greatsword.png',500,375,'5-30','Great Sword',250)]
const backButton = new Button(570,600,60,30,"Back",24)
const nextButton = new Button(570,600,60,30,"Next",24)
var roll = Roll(4)
var rollText = [new Txt(600,100,"Rolling for you attributes you got "+roll.rolls,24),
new Txt(600,130,"So the 3 highest values added together comes to "+roll.total,24),new Txt(600,160,"Where would you like to assign your value of "+roll.total+"?",24)]
const setupTxt = [new Txt(600,100,"Before we begin let's create your character",24), new Txt(600,200,"To do this first we will assign your attribute values by rolling",24),
new Txt(600,230,"4 6-sided dice and adding the 3 highest values together for each attribute",24),new Txt(600,260,"which will result in each attribute ranging from 3 to 18 (higher numbers better)",24),
new Txt(600,360,"After that we will then determine your starting hitpoints by",24), new Txt(600,390,"multiplying your constitution by 2 and adding the values of 3 6-sided dice",24),
new Txt(600,490,"Finally we will determine your starting gold by rolling 20 6-sided dice and adding them together",24)]
const statButtons = [new Button(312.5,350,125,30,"Strength",24), new Button(462.5,350,125,30,"Intelligence",24), new Button(612.5,350,125,30,"Dexterity",24), 
new Button(762.5,350,125,30,"Constitution",24), new Button(375,405,125,30,"Wisdom",24), new Button(525,405,125,30,"Perception",24), new Button(675,405,125,30,"Charisma",24)]
instructions = [new Txt(600,100,"How To Play", 36), new Txt(600,100,"___________", 36), new Txt(600,200,"WASD keys to move", 24), 
new Txt(600,230,"Press the 'e' key to interact when it shows above your player's head",24)]
const startButtons = [new Button(562.5,350,75,30,"Play",24), new Button(562.5,390,135,30,"Instructions",24), new Button(562.5,430,100,30,"Settings",24)]
const t1 = new Txt(600,0,"Welcome To Dungeon Adventure!", 48)
const menuButtons = [new Button(550,300,100,30,"Resume",24), new Button(535,340,130,30,"Instructions",24), new Button(550,380,100,30,"Settings",24)]
const mainButtons = [new Button(290,5,125,30,"Backpack",24), new Button(425,5,75,30,"Menu",24)]
function update(){
    drawRect('#007d00',0,0,1200,800)
    if (instructionsPage == true){
        backButton.blit()
        for (let i=0; i<instructions.length; i++){
            instructions[i].blit()
        }
    }
    else if (inInventory==true){
        backButton.blit()
        backpack.blit()
    }
    else if (inSettings == true){
        backButton.blit()
    }
    else if (inMenu==true){
        drawRect('#7d7d7d',525,275,150,250)
        for (let i=0; i<menuButtons.length; i++){
            menuButtons[i].blit()
        }
    }
    else if (page == 'start'){
        t1.blit()
        for (let i=0; i<startButtons.length; i++){
            startButtons[i].blit()
        }
    }
    else if (page == 'character setup'){
        if (step == 1){
            nextButton.blit()
            for (let i=0; i<setupTxt.length; i++){
                setupTxt[i].blit()
            }
        }
        if (step == 2){
            for (let i=0; i<statButtons.length; i++){
                statButtons[i].blit()
            }
            for (let i=0; i<rollText.length; i++){
                rollText[i].blit()
            }
        }
        if (step == 3){
            for (let i=0; i<rollText.length; i++){
                rollText[i].blit()
            }
            nextButton.blit()
        }
        if (step == 4){
            for (let i=0; i<rollText.length; i++){
                rollText[i].blit()
            }
            nextButton.blit()
        }
        if (step == 5){
            for (let i=0; i<rollText.length; i++){
                rollText[i].blit()
            }
            nextButton.blit()
        }
    }
    else if (page == 'town'){
        try{ctx.drawImage(path,950,0); ctx.drawImage(path,950,200)}
        catch{path.src='path.png'}
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(1025,75,75,0,Math.PI*2,false)
        ctx.fill()
        character.blit()
        shop.draw()
        shop.interaction()
        man.draw()
        speech_bubble.draw()
        money_bag.draw()
        for (let i=0; i<mainButtons.length; i++){
            mainButtons[i].blit()
        }
        if (character.x>=875 && character.x<=1100 && character.y>=0 && character.y<=150){
            character.x = 975
            character.y = 25
            l -= 15
            if (l<750){
                l=750
                time += 1
                if (time>60){
                    page = 'dungeon'
                    setTimeout(() => {l = 2500},0)
                    r = 750
                    character.x = 550
                    character.y = 550
                    time = 0
                }
            }
            ctx.beginPath()
            ctx.lineWidth = 1500
            ctx.arc(1025,75,l,0,Math.PI*2,false)
            ctx.stroke()
        }
        if (r<2500){
            r += 15
            ctx.beginPath()
            ctx.lineWidth = 1500
            ctx.arc(1050,300,r,0,Math.PI*2,false)
            ctx.stroke()
        }
    }
    else if (page == 'shop'){
        backButton.blit()
        for (let i=0; i<shopItems.length; i++){
            shopItems[i].draw()
        }
        ctx.fillStyle = '#ffffff'
        ctx.font = '24px Arial'
        ctx.fillText("Gold -- "+character.gold,1000,25)
    }
    else if (page == 'dungeon'){
        drawRect('#000000',0,0,1200,800)
        rooms[room].draw()
        character.blit()
        if (r<2500){
            r += 15
            ctx.beginPath()
            ctx.lineWidth = 1500
            ctx.arc(600,600,r,0,Math.PI*2,false)
            ctx.stroke()
        }
        for (let i=0; i<mainButtons.length; i++){
            mainButtons[i].blit()
        }
        if (character.y>=690){
            ctx.beginPath()
            ctx.lineWidth = 1500
            ctx.arc(600,750,l,0,Math.PI*2,false)
            ctx.stroke()
            if (l<765){
                l=765
                time += 1
                if (time>60){
                    setTimeout(() => {l=2500},0)
                    character.x = 975
                    character.y = 300
                    page = 'town'
                    time = 0
                    setTimeout(() => {r=750},0)
                }
            }
        }
    }
    requestAnimationFrame(update)
}
update()
window.addEventListener('click', function(e){
    if (instructionsPage == true){
        const clicked = backButton.wasClicked(e)
        if (clicked == true){
            instructionsPage = false
        }
    }
    else if(inInventory==true){
        const clicked = backButton.wasClicked(e)
        if(clicked==true){
            inInventory=false
        }
        backpack.items.find((i) => i.wasClicked(e))
    }
    else if(inSettings==true){
        const clicked = backButton.wasClicked(e)
        if(clicked==true){
            inSettings=false
        }
    }
    else if(inMenu==true){
        const clicked = menuButtons.find((b) => b.wasClicked(e))
        if (clicked != undefined){
            if (clicked.text == 'Settings'){
                inSettings = true
            }
            if (clicked.text == 'Instructions'){
                instructionsPage = true
            }
            if (clicked.text == 'Resume'){
                inMenu = false
            }
        }
    }
    else if (page == 'start'){
        const clicked = startButtons.find((b) => b.wasClicked(e))
        if (clicked != undefined){
            if (clicked.text == 'Play'){
                page = 'character setup'
            }
            if (clicked.text == 'Instructions'){
                instructionsPage = true
            }
            if (clicked.text == 'Settings'){
                inSettings = true
            }
        }
    }
    else if (page == 'character setup'){
        if (step != 2){
            const clicked = nextButton.wasClicked(e)
            if (clicked == true){
                if (step == 3){
                    roll = Roll(20,false)
                    character.gold = roll.total
                    rollText = [new Txt(600,100,"Rolling for your starting gold you got a total of "+character.gold,24), 
                    new Txt(600,130,"So your starting amount of gold is "+character.gold,24)]
                }
                if (step == 4){
                    nextButton.text = 'Begin'
                    rollText = [new Txt(600,50,"Congratulations you have completed creating your character!",36), new Txt(600,160,"Your stats:",24), 
                    new Txt(600,220,"Strength -- "+character.strength,24), new Txt(600,250,"Intelligence -- "+character.intelligence,24), 
                    new Txt(600,280,"Dexterity -- "+character.dexterity,24), new Txt(600,310,"Constitution -- "+character.constitution,24), 
                    new Txt(600,340,"Wisdom -- "+character.wisdom,24), new Txt(600,370,"Perception -- "+character.perception,24), 
                    new Txt(600,400,"Charisma -- "+character.charisma,24), new Txt(600,430,"Hitpoints -- "+character.hp+"/"+character.max_hp,24), 
                    new Txt(600,460,"Gold -- "+character.gold,24)]
                }
                if (step == 5){
                    page = 'town'
                }
                step += 1
            }
        }
        else {
            const clicked = statButtons.find((b) => b.wasClicked(e))
            if (clicked != undefined){
                character.assign(clicked.text.toLowerCase(), roll.total)
                roll = Roll(4)
                statButtons.splice(statButtons.indexOf(clicked), 1)
                rollText = [new Txt(600,100,"Rolling for you attributes you got "+roll.rolls,24),
                new Txt(600,130,"So the 3 highest values added together comes to "+roll.total,24),
                new Txt(600,160,"Where would you like to assign your value of "+roll.total+"?",24)]
                if (statButtons.length == 0){
                    step += 1
                    roll = Roll(3,false)
                    character.hp = character.constitution*2+roll.total
                    character.max_hp = character.constitution*2+roll.total
                    rollText = [new Txt(600,100,"Rolling for your constitution you got "+roll.rolls+" for a total of "+roll.total,24), 
                    new Txt(600,130,"plus your constitution of "+character.constitution+" times 2 gets you an overall value of "+character.hp,24),
                    new Txt(600,160,"So your starting hitpoints is "+character.hp,24)]
                }
            }
        }
    }
    else if (page == 'town'){
        const clicked = mainButtons.find((b) => b.wasClicked(e))
        if (clicked != undefined){
            if (clicked.text == 'Backpack'){
                inInventory = true
            }
            if (clicked.text == 'Menu'){
                inMenu = true
            }
        }
    }
    else if (page == 'shop'){
        const clicked = backButton.wasClicked(e)
        if (clicked == true){page = 'town'}
        shopItems.find((b) => b.wasClick(e))
    }
    else if (page == 'dungeon'){
        const clicked = mainButtons.find((b) => b.wasClicked(e))
        if (clicked != undefined){
            if (clicked.text == 'Backpack'){
                inInventory = true
            }
            if (clicked.text == 'Menu'){
                inMenu = true
            }
        }
    }
})
window.addEventListener('keydown', function(e){
    if (e.key == 'w'){up = true}
    if (e.key == 's'){down = true}
    if (e.key == 'a'){left = true}
    if (e.key == 'd'){right = true}
    if (e.key == 'e'){
        if (page == 'town'){
            const near = shop.wasNear()
            if (near == true){
                page = 'shop'
            }
        }
    }
})
window.addEventListener('keyup', function(e){
    if (e.key == 'w'){up = false}
    if (e.key == 's'){down = false}
    if (e.key == 'a'){left = false}
    if (e.key == 'd'){right = false}
})
window.addEventListener('mousemove', function(e){
    moveX = e.pageX
    moveY = e.pageY
})
