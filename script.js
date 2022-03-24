var save = window.localStorage
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
var page = 'start'
var instructionsPage = false
var inInventory = false
var inMenu = false
var inSettings = false
var inStats = false
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
var dead = false
var moveBattlePlayer = -200
var mustRoll = 8
var gameOver = false
var showShopItems = 'weapon'
function drawRect(color,x,y,width,height){
    ctx.fillStyle = color
    ctx.fillRect(x,y,width,height)
}
class Character{
    constructor(){
        this.xp = 0
        this.x = 550
        this.wearing = undefined
        this.armor = 8
        this.y = 350
        this.player = new Image()
        this.player.src = 'hero.png'
        this.weapon = 'fists'
        this.healthPotions = 0
        this.potions = 0
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
    bonus(bonus, value){
        if (value<=5){this[bonus] = -3}
        else if (value<=7){this[bonus] = -2}
        else if (value<=9){this[bonus] = -1}
        else if (value<=11){this[bonus] = 0}
        else if (value<=13){this[bonus] = 1}
        else if (value<=15){this[bonus] = 2}
        else if (value<=18){this[bonus] = 3}
    }
    attack(){
        var roll = undefined
        if (this.weapon == 'fists'){roll = Roll(1,false,2)}
        if (this.weapon == 'dagger.png'){roll = Roll(1,false)}
        if (this.weapon == 'sharpsword.png'){roll = Roll(1,false,9)}
        if (this.weapon == 'morningstar.png'){roll = Roll(2,false)}
        if (this.weapon == 'longsword.png'){roll = Roll(3,false)}
        if (this.weapon == 'battleaxe.png'){roll = Roll(4,false)}
        if (this.weapon == 'greatsword.png'){roll = Roll(5,false)}
        return roll
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
        this.armor = new Image
        this.armor.src = 'armor.png'
        this.arc = 'armor.png'
    }
    blit(){
        drawRect('#000000',625,50,400,1)
        drawRect('#000000',625,500,400,1)
        drawRect('#000000',1025,50,1,450)
        drawRect('#000000',935,50,1,90)
        drawRect('#000000',935,140,90,1)
        drawRect('#000000',715,50,1,90)
        drawRect('#000000',625,140,90,1)
        try{if (character.weapon == 'fists'){ctx.drawImage(this.fist,935,50)}}
        catch{this.fist.src = 'fist.png'}
        try{if (character.wearing == undefined){ctx.drawImage(this.armor,625,50)}}
        catch{this.armor.src = this.arc}
        for (let i=0; i<6; i++){
            drawRect('#000000',175,50+i*90,450,1)
            drawRect('#000000',175+i*90,50,1,450)
        }
        for (let i=0; i<this.items.length; i++){
            this.items[i].draw()
        }
    }
    addItem(img,type){
        const possibleSlots = [...Array(this.slotCount).keys()].filter(i => this.items.every(item => item.slot !== i))
        var slot = Math.min(...possibleSlots)
        this.items.push(new Item(img,slot,type))
    }
    removeItem(img){
        const slot = this.items.findIndex(item => item.img = img)
        this.items.splice(slot,1)
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
    if (x>=945 && x<=1035 && y>=60 && y<=150){
        return {'slotX':'weapon slot', 'slotY':'weapon slot'}
    }
    if (x>=635 && x<=720 && y>=60 && y<=150){
        return {'slotX':'armor slot', 'slotY':'armor slot'}
    }
}
class Item{
    constructor(img,slot,type){
        this.img = new Image()
        this.img.src = img
        this.src = img
        this.slot = slot
        this.slotX = slot
        this.slotY = 0
        this.move = false
        this.time = 250
        this.type = type
        while (this.slotX>4){
            this.slotX -= 5
            this.slotY += 1
        }
    }
    draw(){
        if (this.move == false){
            try{
                if (this.slotX == 'weapon slot'){ctx.drawImage(this.img,935,50)}
                else if (this.slotX == 'armor slot'){ctx.drawImage(this.img,625,50)}
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
                if (this.type == 'weapon' && slot.slotX != 'armor slot'){
                    this.slotX = slot.slotX
                    this.slotY = slot.slotY
                    this.slot = this.slotX + this.slotY*5
                    if (slot.slotX == 'weapon slot'){
                        setTimeout(() => {character.weapon = this.src}, 0)
                    }
                    this.move = false
                }
                else if(this.type == 'armor' && slot.slotX != 'weapon slot'){
                    this.slotX = slot.slotX
                    this.slotY = slot.slotY
                    this.slot = this.slotX + this.slotY*5
                    if (this.slotX == 'armor slot'){
                        setTimeout(() => {character.wearing = this.src}, 0)
                        if (this.src == 'cloth-armor.png'){
                            setTimeout(() => {character.armor = 10}, 0)
                        }
                        if (this.src == 'leather-armor.png'){
                            setTimeout(() => {character.armor = 11}, 0)
                        }
                        if (this.src == 'studded-leather-armor.png'){
                            setTimeout(() => {character.armor = 12}, 0)
                        }
                        if (this.src == 'scale-mail-armor.png'){
                            setTimeout(() => {character.armor = 13}, 0)
                        }
                        if (this.src == 'plate-mail-armor.png'){
                            setTimeout(() => {character.armor = 15}, 0)
                        }
                        if (this.src == 'chain-mail-armor.png'){
                            setTimeout(() => {character.armor = 14}, 0)
                        }
                    }
                    this.move = false
                }
                else{
                    if (slot.slotX != 'weapon slot' && slot.slotX != 'armor slot'){
                        this.slotX = slot.slotX
                        this.slotY = slot.slotY
                        this.slot = this.slotX + this.slotY*5
                        this.move = false
                    }
                }
            }
        }
        else{
            if (this.slotX == 'weapon slot'){
                if (x>=945 && x<=1035 && y>=60 && y<=150){
                    this.move = true
                    character.weapon = 'fists'
                }
            }
            else if (this.slotX == 'armor slot'){
                if (x>=635 && x<=720 && y>=60 && y<=150){
                    this.move = true
                    character.wearing = undefined
                    character.armor = 8
                }
            }
            else{
                if (x>=this.slotX*90+185 && x<=this.slotX*90+275 && y>=this.slotY*90+60 && y<=this.slotY*90+150){
                    this.move = true
                    this.slot = undefined
                }
            }
        }
    }
}
const droppedItems = []
var backpack = new Backpack()
const shop = new object('shop.png',120,250,true)
const man = new object('man.png',195,390)
const speech_bubble = new object('chat.png',225,350)
const money_bag = new object('money-bag.png',230,350)
var character = new Character()
const path = new Image()
path.src = 'path.png'
function generateRandomMonster(){
    var chance = Math.random()
    var monster = undefined
    if (chance>0.8){
        var pick = Math.round(Math.random()*4+1)
        if (pick == 1){
            monster = new Goblin()
        }
        if (pick == 2){
            monster = new Troll()
        }
        if (pick == 3){
            monster = new BugBear()
        }
        if (pick == 4){
            monster = new Skeleton()
        }
        if (pick == 5){
            monster = new Slime()
        }
    }
    return monster
}
function Roll(dice, min=true, sides=5){
    const rolls = []
    var total = 0
    for (let i=0; i<dice; i++){
        const die = Math.round(Math.random()*sides+1)
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
    constructor(x,y,text,size,color='#000000'){
        this.x = x
        this.y = y
        this.text = text
        this.height = size
        this.font = size+"px Arial"
        this.color = color
    }
    blit(){
        ctx.fillStyle = this.color
        ctx.font = this.font
        let width = ctx.measureText(this.text).width
        ctx.fillText(this.text, this.x-width/2, this.y+this.height)
    }
}
class ShopItem{
    constructor(img,x,y,dmg,name,cost,type,uses=1){
        this.img = new Image()
        this.src = img
        this.img.src = img
        this.x = x
        this.cost = cost
        this.y = y
        this.type = type
        this.uses = uses
        this.button = new Button(x,y+175,90,30,"Buy",24)
        if (type == 'weapon'){this.dmgTxt = new Txt(x+45,y+100,"Damage -- "+dmg,24)}
        else{this.dmgTxt = new Txt(x+45,y+100,"Armor Class -- "+dmg,24)}
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
            if (character.gold>=this.cost && backpack.items.length<=25-this.uses){
                for (let i=0; i<this.uses; i++){backpack.addItem(this.src,this.type)}
                if (this.src == 'health-potion.png'){
                    character.healthPotions += 3
                    character.potions += 3
                }
                character.gold -= this.cost
            }
        }
    }
}
class Room{
    constructor(north,south,west,east,northRoom=undefined,southRoom=undefined,westRoom=undefined,eastRoom=undefined,monster=undefined){
        this.north = north
        this.west = west
        this.south = south
        this.east = east
        this.northRoom = northRoom
        this.southRoom = southRoom
        this.eastRoom = eastRoom
        this.westRoom = westRoom
        this.monster = monster
    }
    draw(){
        if (this.monster != undefined){page = 'battle'}
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
                    if (rooms[room].monster == undefined){
                        rooms[room].monster = generateRandomMonster()
                    }
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
                if (rooms[room].monster == undefined){
                    rooms[room].monster = generateRandomMonster()
                }
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
                if (rooms[room].monster == undefined){
                    rooms[room].monster = generateRandomMonster()
                }
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
                if (rooms[room].monster == undefined){
                    rooms[room].monster = generateRandomMonster()
                }
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
function monsterChoiceType(){
    var choice = undefined
    die = Math.round(Math.random()*2+1)
    if (die==1){choice = 'up high'}
    if (die==2){choice = 'in the middle'}
    if (die==3){choice = 'down low'}
    return choice
}
class Monster{
    constructor(name,dexterity,gold,xp,dice){
        this.playerDmg = undefined
        this.playerChoice = undefined
        this.monsterChoice = undefined
        this.gold = gold
        this.xp = xp
        this.dice = dice
        this.x = 1200
        this.turn = undefined
        this.step = 1
        this.name = name
        this.dexterity = dexterity
        this.txt1 = new Txt(600,610,"It's a "+this.name+"!",24,'#ff0000')
        this.txt2 = new Txt(600,640,"First we need to roll a 20-sided die to determine who goes first",24,'#ffffff')
        this.txt3 = new Txt(600,670,"You must roll the "+this.name+"'s dexterity of "+this.dexterity+" or higher to go first",24,'#ffffff')
        this.txt4 = new Txt(600,610,"It is your turn. What would you like to do?",24,"#ffffff")
        this.txt5 = new Txt(600,610,"How would you like to attack?",24,'#ffffff')
        this.txt6 = new Txt(600,610,"The "+this.name+" is attacking you. How will you attempt to defend?",24,'#ffffff')
        this.nextButton = new Button(550,770,100,30,"Next",24)
        this.Buttons = [new Button(495,700,100,30,"Attack",24), new Button(605,700,100,30,"Drink Potion",20)]
        this.HMLButtons = [new Button(390,700,125,30,"Up High",24), new Button(525,700,150,30,"In The Middle",24), new Button(685,700,125,30,"Down Low",24)]
    }
    draw(){
        if(this.x>500){this.x-=20}
        try{ctx.drawImage(this.img,this.x,100)}
        catch{this.img.src = this.src}
        drawRect('#ffffff',this.x,50,150,20)
        drawRect('#ff0000',this.x,50,(this.hp/this.max_hp)*150,20)
        ctx.fillStyle = '#000000'
        ctx.font = '24px Arial'
        let width = ctx.measureText(this.hp+"/"+this.max_hp).width
        ctx.fillText(this.hp+"/"+this.max_hp,this.x+75-width/2,30)
        width = ctx.measureText(character.hp+"/"+character.max_hp).width
        ctx.fillText(character.hp+"/"+character.max_hp,moveBattlePlayer+65-width/2,300)
        drawRect('#ffffff',moveBattlePlayer-10,315,150,20)
        drawRect('#ff0000',moveBattlePlayer-10,315,(character.hp/character.max_hp)*150,20)
        if (this.x<=500){drawRect('#2e2e2e',0,600,1200,200)}
        if (this.step == 1 && this.x<=500){
            this.txt1.blit()
            this.txt2.blit()
            this.txt3.blit()
            this.nextButton.blit()
        }
        else if (this.step == 2){
            for (let i=0; i<rollText.length; i++){
                rollText[i].blit()
            }
            this.nextButton.blit()
        }
        else{
            if (this.turn == 'player'){
                if (this.step == 3){
                    this.txt4.blit()
                    for (let i=0; i<this.Buttons.length; i++){
                        this.Buttons[i].blit()
                    }
                }
                if (this.step == 4){
                    this.txt5.blit()
                    for (let i=0; i<this.HMLButtons.length; i++){this.HMLButtons[i].blit()}
                }
                if (this.step == 5){
                    this.nextButton.blit()
                    for (let i=0; i<rollText.length; i++){rollText[i].blit()}
                }
                if (this.step == 6){
                    this.nextButton.blit()
                    for (let i=0; i<rollText.length; i++){rollText[i].blit()}
                }
                if (this.step == 7){
                    for (let i=0; i<rollText.length; i++){rollText[i].blit()}
                    this.nextButton.blit()
                }
                if (this.step == 8){
                    for (let i=0; i<rollText.length; i++){rollText[i].blit()}
                    this.nextButton.blit()
                }
            }
            if (this.turn == 'monster'){
                if (this.step == 3){
                    this.txt6.blit()
                    for (let i=0; i<this.HMLButtons.length; i++){this.HMLButtons[i].blit()}
                }
                if (this.step == 4){
                    this.nextButton.blit()
                    for (let i=0; i<rollText.length; i++){rollText[i].blit()}
                }
                if (this.step == 5){
                    this.nextButton.blit()
                    for (let i=0; i<rollText.length; i++){rollText[i].blit()}
                }
            }
        }
    }
}
class Goblin extends Monster{
    constructor(name='goblin', dexterity=10, gold=Math.round(Math.random()*15+5), xp=15, dice=2){
        super(name,dexterity,gold,xp,dice)
        this.img = new Image()
        this.img.src = 'goblin.png'
        this.src = 'goblin.png'
        this.strength = 10
        this.armor = 10
        this.hp = Math.round(Math.random()*10+15)
        this.max_hp = this.hp
    }
}
class Troll extends Monster{
    constructor(name='troll',dexterity=11,gold=Math.round(Math.random()*20+10), xp=25, dice=2){
        super(name,dexterity,gold,xp,dice)
        this.img = new Image()
        this.img.src = 'troll.png'
        this.src = 'troll.png'
        this.strength = 11
        this.armor = 11
        this.hp = Math.round(Math.random()*15+15)
        this.max_hp = this.hp
    }
}
class Slime extends Monster{
    constructor(name='slime',dexterity=8,gold=Math.round(Math.random()*7+3),xp=15,dice=2){
        super(name,dexterity,gold,xp,dice)
        this.img = new Image()
        this.img.src = 'green-slime.png'
        this.src = 'green-slime.png'
        this.strength = 10
        this.armor = 8
        this.hp = Math.round(Math.random()*5+10)
        this.max_hp = this.hp
    }
}
class BugBear extends Monster{
    constructor(name='bug bear',dexterity=12,gold=Math.round(Math.random()*20+10),xp=30,dice=3){
        super(name,dexterity,gold,xp,dice)
        this.img = new Image()
        this.img.src = 'bear.png'
        this.src = 'bear.png'
        this.strength = 11
        this.armor = 12
        this.hp = Math.round(Math.random()*20+20)
        this.max_hp = this.hp
    }
}
class Skeleton extends Monster{
    constructor(name='skeleton',dexterity=11,gold=Math.round(Math.random()*15+5),xp=10,dice=2){
        super(name,dexterity,gold,xp,dice)
        this.img = new Image()
        this.img.src = 'skeleton.png'
        this.src = 'skeleton.png'
        this.strength = 10
        this.armor = 10
        this.hp = Math.round(Math.random()*10+5)
        this.max_hp = this.hp
    }
}
var stats = undefined
const biggerPlayerImg = new Image()
biggerPlayerImg.src = 'bigger_hero.png'
var rooms = [new Room(true,true,false,false,1,'town',undefined,undefined), new Room(true,true,true,false,2,0,3,undefined,new Goblin()), new Room(true,true,true,true,12,1,7,8),
new Room(false,false,true,true,undefined,undefined,4,1), new Room(true,false,true,true,6,undefined,5,3), //4
new Room(false,false,false,true,undefined,undefined,undefined,4,new BugBear()), new Room(true,true,false,true,20,4,undefined,7), //6
new Room(false,false,true,true,undefined,undefined,6,2), new Room(false,false,true,true,undefined,undefined,2,9), //8
new Room(false,true,true,true,undefined,10,8,15,new Skeleton()), new Room(true,true,false,false,9,11), //10
new Room(true,false,false,false,10,undefined,undefined,undefined,new BugBear()), new Room(true,true,false,true,37,2,undefined,13), //12
new Room(false,false,true,true,undefined,undefined,12,14,new Goblin()), new Room(true,true,true,true,44,15,13,19), //14
new Room(true,true,true,true,14,16,9,18,new Slime()), new Room(true,false,false,true,15,undefined,undefined,17), //16
new Room(false,false,true,false,undefined,undefined,16,undefined,new Troll()), new Room(false,false,true,false,undefined,undefined,15), //18
new Room(true,false,true,false,45,undefined,14,undefined), new Room(true,true,false,false,21,6),  //20
new Room(true,true,true,false,23,20,22), new Room(false,false,false,true,undefined,undefined,undefined,21),  //22
new Room(true,true,false,false,24,21), new Room(true,true,false,true,25,23,undefined,35), //24
new Room(true,true,false,false,26,24), new Room(false,true,false,true,undefined,25,undefined,27,new Goblin()),  //26
new Room(false,false,true,true,undefined,undefined,26,28), new Room(false,true,true,false,undefined,29,27,undefined,new Skeleton()),  //28
new Room(true,true,true,true,28,34,32,30), new Room(false,false,true,true,undefined,undefined,29,31),  //30
new Room(false,false,true,false,undefined,undefined,30), new Room(false,false,true,true,undefined,undefined,33,29), //32
new Room(false,false,false,true,undefined,undefined,undefined,32), new Room(true,true,true,true,29,37,35,38,new Troll()),  //34
new Room(false,true,true,true,undefined,36,24,34), new Room(true,false,false,false,35), //36
new Room(true,true,false,false,34,12), new Room(false,true,true,true,undefined,39,34,41),   //38
new Room(true,true,false,false,38,40), new Room(true,false,false,false,39,undefined,undefined,undefined,new Troll()),  //40
new Room(false,true,true,true,undefined,42,38,48,new Skeleton()), new Room(true,true,false,false,41,43),  //42
new Room(true,true,false,false,42,44), new Room(true,true,false,false,43,14,undefined,undefined),  //44
new Room(true,true,false,false,46,19), new Room(true,true,false,false,47,45),   //46
new Room(true,true,true,false,49,46,48), new Room(false,false,true,true,undefined,undefined,41,47),   //48
new Room(true,true,false,false,50,47), new Room(false,true,true,true,undefined,49,52,51),  //50
new Room(false,false,true,false,undefined,undefined,50), new Room(true,false,false,true,53,undefined,undefined,50,new BugBear()),   //52
new Room(true,true,true,true,57,52,58,54), new Room(true,false,true,true,56,undefined,53,55),   //54
new Room(false,false,true,false,undefined,undefined,54,undefined,new Slime()), new Room(false,true,false,false,undefined,54),   //56
new Room(false,true,false,false,undefined,53), new Room(true,false,true,true,59,undefined,60,53),    //58
new Room(false,true,false,false,undefined,58), new Room(true,false,false,true,61,undefined,undefined,58),   //60
new Room(false,true,false,false,undefined,60,undefined,undefined,new BugBear())]  //61
const shopItems = [new ShopItem('dagger.png',100,75,'1-6','Dagger',5,'weapon'), new ShopItem('sharpsword.png',300,75,'1-10','Sharp Sword',10,'weapon'),
new ShopItem('morningstar.png',500,75,'2-12','Morningstar',20,'weapon'), new ShopItem('longsword.png',100,375,'3-18','Long Sword',50,'weapon'), 
new ShopItem('battleaxe.png',300,375,'4-24','Battleaxe',125,'weapon'),new ShopItem('greatsword.png',500,375,'5-30','Great Sword',250,'weapon'),
new ShopItem('health-potion.png',100,75,'','Health Potion(3)',15,'potion',3), new ShopItem('leather-armor.png',400,75,11,'Leather Armor',60,'armor'),
new ShopItem('studded-leather-armor.png',700,75,12,'Studded Leather Armor',90,'armor'), new ShopItem('scale-mail-armor.png',100,375,13,"Scale Mail Armor",200,'armor'), 
new ShopItem('cloth-armor.png',100,75,10,'Cloth Armor',30,'armor'), new ShopItem('plate-mail-armor.png',700,375,15,'Plate Mail Armor',800,'armor'),
new ShopItem('chain-mail-armor.png',400,375,14,'Chain Mail Armor',400,'armor')]
shopItems[6].dmgTxt = new Txt(145,175,"Heals: 5-30",24)
const backButton = new Button(570,600,60,30,"Back",24)
const nextButton = new Button(570,600,60,30,"Next",24)
const shopButtons = [new Button(900,300,100,30,"Weapons",24), new Button(900,350,100,30,"Potions",24), new Button(900,400,100,30,"Armor",24)]
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
const mainButtons = [new Button(290,5,125,30,"Backpack",24), new Button(425,5,75,30,"Menu",24), new Button(510,5,75,30,"Stats",24)]
var deadTxt = [new Txt(600,100,"You are dead!",24,"#ff0000"), new Txt(600,130,"But wait its not over. Let's see if the gods will revive you",24),
new Txt(600,160,"You must roll a(n) "+mustRoll+" or higher on a 20-sided die",24),new Txt(600,190,"You can be revived up to 3 times with each time getting harder to be revived",24),
new Txt(600,220,"When you get revived you get sent back to the start of the dungeon with half of your max hitpoints(rounded up)",24)]
const gameOverTxt = [new Txt(600,250,"Game Over!",48,'#ff0000'), new Txt(600,300,"press 'r' to restart",24)]
var num = 0
function update(){
    num += 1
    save.setItem('character', num)
    drawRect('#007d00',0,0,1200,800)
    if (page == 'game over'){for (let i=0; i<gameOverTxt.length; i++){gameOverTxt[i].blit()}}
    else if (dead == true){
        for (let i=0; i<deadTxt.length; i++){deadTxt[i].blit()}
        nextButton.blit()
    }
    else if (instructionsPage == true){
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
    else if (inStats == true){
        stats = [new Txt(600,100,"HP -- "+character.hp+"/"+character.max_hp,24),new Txt(600,130,"Gold -- "+character.gold,24),
        new Txt(600,160,"XP -- "+character.xp,24),
        new Txt(600,190,"Strength: "+character.strength+"  ||  Bonus:"+character.strengthBonus,24),
        new Txt(600,220,'Intelligence: '+character.intelligence+"  ||  Bonus:"+character.intelligenceBonus,24), 
        new Txt(600,250,"Dexterity: "+character.dexterity+"  ||  Bonus:"+character.dexterityBonus,24),
        new Txt(600,280,"Constitution: "+character.constitution+"  ||  Bonus:"+character.constitutionBonus,24), 
        new Txt(600,310,"Wisdom: "+character.wisdom+"  ||  Bonus:"+character.wisdomBonus,24),
        new Txt(600,340,"Perception: "+character.perception+"  ||  Bonus:"+character.perceptionBonus,24),
        new Txt(600,370,"Charisma: "+character.charisma+"  ||  Bonus:"+character.charismaBonus,24)]
        drawRect('#7d7d7d',400,90,400,500)
        backButton.blit()
        for (let i=0; i<stats.length; i++){stats[i].blit()}
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
        for (let i=0; i<shopButtons.length; i++){shopButtons[i].blit()}
        backButton.blit()
        if (showShopItems == 'weapon'){
            for (let i=0; i<6; i++){
                shopItems[i].draw()
            }
        }
        if (showShopItems == 'potion'){
            shopItems[6].draw()
        }
        if (showShopItems == 'armor'){
            for (let i=7; i<shopItems.length; i++){
                shopItems[i].draw()
            }
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
    else if (page == 'battle'){
        drawRect('#7d7d7d',0,0,1200,800)
        try{ctx.drawImage(biggerPlayerImg, moveBattlePlayer, 350); if(moveBattlePlayer<500){moveBattlePlayer += 20}else{moveBattlePlayer=505}}
        catch{biggerPlayerImg.src = 'bigger_hero.png'}
        rooms[room].monster.draw()
    }
    requestAnimationFrame(update)
}
update()
window.addEventListener('click', function(e){
    if (dead == true){
        const clicked = nextButton.wasClicked(e)
        if (clicked == true){
            if (gameOver == true){
                page = 'game over'
            }
            else{
                room = 0
                dead = false
                character.hp = Math.ceil(character.max_hp/2)
                page = 'dungeon'
            }
            deadTxt = [new Txt(600,100,"You are dead!",24,"#ff0000"), new Txt(600,130,"But wait its not over. Let's see if the gods will revive you",24),
            new Txt(600,160,"You must roll a(n) "+mustRoll+" or higher on a 20-sided die",24),new Txt(600,190,"You can be revived up to 3 times with each time getting harder to be revived",24),
            new Txt(600,220,"When you get revived you get sent back to the start of the dungeon with half of your max hitpoints(rounded up)",24)]
        }
    }
    else if (instructionsPage == true){
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
    else if (inStats == true){
        const clicked = backButton.wasClicked(e)
        if (clicked == true){
            inStats = false
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
                character.bonus(clicked.text.toLowerCase()+'Bonus',character[clicked.text.toLowerCase()])
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
            if (clicked.text == 'Stats'){
                inStats = true
            }
        }
    }
    else if (page == 'shop'){
        const clickedBack = backButton.wasClicked(e)
        if (clickedBack == true){page = 'town'}
        const clicked = shopButtons.find((b) => b.wasClicked(e))
        if (clicked != undefined){
            if (clicked.text == 'Weapons'){
                showShopItems = 'weapon'
            }
            if (clicked.text == 'Potions'){
                showShopItems = 'potion'
            }
            if (clicked.text == 'Armor'){
                showShopItems = 'armor'
            }
        }
        if (showShopItems == 'weapon'){
            for (let i=0; i<6; i++){
                shopItems[i].wasClick(e)
            }
        }
        if (showShopItems == 'potion'){
            shopItems[6].wasClick(e)
        }
        if (showShopItems == 'armor'){
            for (let i=7; i<shopItems.length; i++){
                shopItems[i].wasClick(e)
            }
        }
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
            if (clicked.text == 'Stats'){
                inStats = true
            }
        }
    }
    else if (page == 'battle'){
        const battle = rooms[room].monster
        if (battle.step<3 && battle.x<=500){
            const clicked = battle.nextButton.wasClicked(e)
            if (clicked == true){
                if (battle.step == 1){
                    roll = Math.round(Math.random()*19+1)
                    const total = roll+character.dexterityBonus
                    rollText = [new Txt(600,610,"Rolling to go first you rolled a "+roll,24,'#ffffff'), 
                    new Txt(600,640,"plus your dexterity bonus of "+character.dexterityBonus+" for a total of "+total,24,'#ffffff')]
                    if (total>=battle.dexterity){
                        battle.turn = 'player'
                        rollText.push(new Txt(600,670,"You rolled the "+battle.name+"'s dexterity of "+battle.dexterity+", so you get to go first!",24,'#00ff00'))
                    }
                    else{
                        battle.turn = 'monster'
                        rollText.push(new Txt(600,670,"You rolled lower than the "+battle.name+"'s of "+battle.dexterity+", so the "+battle.name+" get's to go first",24,'#ff0000'))
                    }
                }
                battle.step += 1
            }
        }
        else{
            if (battle.turn == 'player'){
                if (battle.step == 3){
                    const clicked = battle.Buttons.find((b) => b.wasClicked(e))
                    if (clicked != undefined){
                        if (clicked.text == 'Attack'){
                            battle.step += 1
                        }
                        if (clicked.text == 'Drink Potion' && character.potions>0 && character.hp<character.max_hp){
                            battle.step = 8
                            character.potions -= 1
                            character.healthPotions -= 1
                            roll = Roll(5,false)
                            const total = roll.total + character.constitutionBonus
                            character.hp += total
                            if (character.hp>character.max_hp){character.hp = character.max_hp}
                            rollText = [new Txt(600,610,"You drink your healing potion",24,'#ffffff'),
                            new Txt(600,640,"Rolling to heal you get "+roll.rolls+" for a total of "+roll.total,24,'#ffffff'),
                            new Txt(600,670,"plus your constitution bonus of "+character.constitutionBonus+" gives you a total of "+total,24,'#ffffff'),
                            new Txt(600,700,"So you heal for "+total+" HP",24,'#ffffff'),
                            new Txt(600,730,"It is now the "+battle.name+"'s turn",24,"#ffffff")]
                            backpack.removeItem('health-potion.png')
                        }
                    }
                }
                else if (battle.step == 4){
                    const clicked = battle.HMLButtons.find((b) => b.wasClicked(e))
                    if (clicked != undefined){
                        battle.playerChoice = clicked.text.toLowerCase()
                        battle.monsterChoice = monsterChoiceType()
                        battle.step+=1
                        rollText = [new Txt(600,610,"You attack the "+battle.name+" "+battle.playerChoice,24,'#ffffff'), 
                        new Txt(600,640,"The "+battle.name+" defends "+battle.monsterChoice,24,'#ffffff'), 
                        new Txt(600,670,"We first must roll to hit the "+battle.name+" on a 20-sided die",24,"#ffffff"),
                        new Txt(600,700,"You must roll the "+battle.name+"'s armor of "+battle.armor+" or higher",24,'#ffffff')]
                    }
                }
                else if (battle.step == 5){
                    const clicked = battle.nextButton.wasClicked(e)
                    if (clicked == true){
                        battle.step += 1
                        roll = Roll(1,false,19)
                        const total = roll.total + character.strengthBonus
                        rollText = [new Txt(600,610,"Rolling to hit the "+battle.name+", you roll a "+roll.total,24,'#ffffff'), 
                        new Txt(600,640,"plus your strength bonus of "+character.strengthBonus+" for a total of "+total,24,'#ffffff')]
                        if (total>=battle.armor){
                            battle.playerDmg = character.attack()
                            rollText.push(new Txt(600,670,"You rolled the "+battle.name+"'s armor of "+battle.armor+", so you hit the "+battle.name+"!", 24,'#00ff00'))
                        }
                        else{
                            battle.playerDmg = undefined
                            rollText.push(new Txt(600,670,"You rolled less than the "+battle.name+"'s armor so you missed",24,'#ff0000'))
                        }
                    }
                }
                else if (battle.step == 6){
                    const clicked = battle.nextButton.wasClicked(e)
                    if (clicked == true){
                        if (battle.playerDmg != undefined){
                            battle.step += 1
                            rollText = [new Txt(600,610,"Rolling to hit the "+battle.name+" you got "+battle.playerDmg.rolls+" for a total of "+battle.playerDmg.total+" damage with your "+character.weapon.slice(0,character.weapon.length-4),24,'#00ff00')]
                            if (battle.playerChoice == battle.monsterChoice){
                                battle.playerDmg.total = Math.ceil(battle.playerDmg.total/2)
                                rollText.push(new Txt(600,640,"But since the "+battle.name+" successfully defended your attack you only do have damage(rounded up) for a total of "+battle.playerDmg.total,24,'#ff0000'))
                            }
                            battle.hp -= battle.playerDmg.total
                            if (battle.hp<=0){
                                battle.hp = 0
                                character.gold += battle.gold
                                character.xp += battle.xp
                                rollText.push(new Txt(600,670,"You have killed the "+battle.name+"!",24,'#00ff00'))
                                rollText.push(new Txt(600,700,"You search the dead "+battle.name+"'s body and find "+battle.gold+" gold. You now have "+character.gold+" gold",24,'#ffffff'))
                                rollText.push(new Txt(600,730,"You also gain "+battle.xp+" experience for killing the "+battle.name,24,'#ffffff'))
                            }
                            else{
                                rollText.push(new Txt(600,670,"It is now the "+battle.name+"'s turn",24,'#ffffff'))
                            }
                        }
                        else{
                            battle.turn = 'monster'
                            battle.step = 3
                        }
                    }
                }
                else if (battle.step == 7){
                    const clicked = battle.nextButton.wasClicked(e)
                    if (clicked == true){
                        if (battle.hp <=0 ){
                            character.gold += battle.gold
                            character.xp += battle.xp
                            rooms[room].monster = undefined
                            page = 'dungeon'
                        }
                        else{
                            battle.turn = 'monster'
                            battle.step = 3
                        }
                    }
                }
                else if (battle.step == 8){
                    const clicked = battle.nextButton.wasClicked(e)
                    if (clicked == true){
                        battle.step = 3
                        battle.turn = 'monster'
                    }
                }
            }
            if (battle.turn == 'monster'){
                if (battle.step == 3){
                    const clicked = battle.HMLButtons.find((b) => b.wasClicked(e))
                    if (clicked != undefined){
                        battle.playerChoice = clicked.text.toLowerCase()
                        battle.monsterChoice = monsterChoiceType()
                        battle.step+=1
                        rollText = [new Txt(600,610,"You defend "+battle.playerChoice,24,'#ffffff'),
                        new Txt(600,640,"The "+battle.name+" attacks "+battle.monsterChoice,24,'#ffffff'),
                        new Txt(600,670,"The "+battle.name+" must roll your armor of "+character.armor+" or higher on a 20-sided die to hit you",24,'#ffffff')]
                    }
                }
                else if (battle.step == 4){
                    const clicked = battle.nextButton.wasClicked(e)
                    if (clicked == true){
                        battle.step += 1
                        roll = Math.round(Math.random()*19+1)
                        rollText = [new Txt(600,610,"Rolling to hit you the "+battle.name+" rolled a(n) "+roll,24,'#ffffff')]
                        if (roll>=character.armor){
                            roll = Roll(battle.dice,false,5)
                            rollText.push(new Txt(600,640,"The "+battle.name+" rolled your armor of "+character.armor+" and hits you!",24,'#ff0000'))
                            rollText.push(new Txt(600,670,"Rolling for damage the "+battle.name+" rolls "+roll.rolls+" for a total of "+roll.total+" damage",24,'#ff0000'))
                            if (battle.playerChoice == battle.monsterChoice){
                                roll.total = Math.ceil(roll.total/2)
                                rollText.push(new Txt(600,700,"But since you successfully defend the attack the "+battle.name+" does half damage(rounded up) for a total of "+roll.total,24,'#00ff00'))
                            }
                            character.hp -= roll.total
                            if (character.hp<0){character.hp=0}
                        }
                        else{
                            rollText.push(new Txt(600,640,"The "+battle.name+" rolled less than your armor and misses you!",24,'#00ff00'))
                        }
                    }
                }
                else if (battle.step == 5){
                    const clicked = battle.nextButton.wasClicked(e)
                    if (clicked == true){
                        if(character.hp==0){
                            dead = true
                            roll = Math.round(Math.random()*19+1)
                            total = roll+character.wisdomBonus
                            deadTxt.push(new Txt(600,290,"Rolling the die you get a(n) "+roll+" plus your wisdom bonus of "+character.wisdomBonus+" gets you a total of "+total,24))
                            if (total>=mustRoll){
                                mustRoll += 4
                                deadTxt.push(new Txt(600,390,"The gods are pleased with you and revive you back to the start of the dungeon!",24,'#00ff00'))
                            }
                            else{
                                gameOver = true
                                deadTxt.push(new Txt(600,390,"The gods ignore you leaving your dead body for the monsters of the dungeon to feed on",24,'#ff0000'))
                            }
                            nextButton.text = 'Next'
                        }
                        else{
                            battle.turn = 'player'
                            battle.step = 3
                        }
                    }
                }
            }
        }
    }
})
window.addEventListener('keydown', function(e){
    if (page == 'game over'){
        if (e.key == 'r'){
            page = 'start'
            room = 0
            dead = false
            mustRoll = 8
            gameOver = false
            backpack = new Backpack()
            character = new Character()
            roll = Roll(4)
            rollText = [new Txt(600,100,"Rolling for you attributes you got "+roll.rolls,24),
            new Txt(600,130,"So the 3 highest values added together comes to "+roll.total,24),
            new Txt(600,160,"Where would you like to assign your value of "+roll.total+"?",24)]
            rooms = [new Room(true,true,false,false,1,'town',undefined,undefined), new Room(true,true,true,false,2,0,3,undefined,new Goblin()), new Room(true,true,true,true,12,1,7,8),
            new Room(false,false,true,true,undefined,undefined,4,1), new Room(true,false,true,true,6,undefined,5,3), 
            new Room(false,false,false,true,undefined,undefined,undefined,4,new Goblin()), new Room(true,true,false,true,20,4,undefined,7),
            new Room(false,false,true,true,undefined,undefined,6,2), new Room(false,false,true,true,undefined,undefined,2,9),
            new Room(false,true,true,true,undefined,10,8,15), new Room(true,true,false,false,9,11), 
            new Room(true,false,false,false,10), new Room(true,true,false,true,37,2,undefined,13,new Goblin()),
            new Room(false,false,true,true,undefined,undefined,12,14), new Room(true,true,true,true,44,15,13,19), 
            new Room(true,true,true,true,14,16,9,18), new Room(true,false,false,true,15,undefined,undefined,17),
            new Room(false,false,true,false,undefined,undefined,16), new Room(false,false,true,false,undefined,undefined,15),
            new Room(true,false,true,false,45,undefined,14,undefined,new Goblin()), new Room(true,true,false,false,21,6), 
            new Room(true,true,true,false,23,20,22), new Room(false,false,false,true,undefined,undefined,undefined,21),
            new Room(true,true,false,false,24,21), new Room(true,true,false,true,25,23,undefined,35,new Goblin()),
            new Room(true,true,false,false,26,24), new Room(false,true,false,true,undefined,25,undefined,27),
            new Room(false,false,true,true,undefined,undefined,26,28), new Room(false,true,true,false,undefined,29,27),
            new Room(true,true,true,true,28,34,32,30), new Room(false,false,true,true,undefined,undefined,29,31,new Goblin()),
            new Room(false,false,true,false,undefined,undefined,30), new Room(false,false,true,true,undefined,undefined,33,29),
            new Room(false,false,false,true,undefined,undefined,undefined,32), new Room(true,true,true,true,29,37,35,38),
            new Room(false,true,true,true,undefined,36,24,34), new Room(true,false,false,false,35),
            new Room(true,true,false,false,34,12), new Room(false,true,true,true,undefined,39,34,41), 
            new Room(true,true,false,false,38,40), new Room(true,false,false,false,39,undefined,undefined,undefined,new Goblin()),
            new Room(false,true,true,true,undefined,42,38,48), new Room(true,true,false,false,41,43),
            new Room(true,true,false,false,42,44), new Room(true,true,false,false,43,14,undefined,undefined,new Goblin()),
            new Room(true,true,false,false,46,19), new Room(true,true,false,false,47,45),
            new Room(true,true,true,false,49,46,48), new Room(false,false,true,true,undefined,undefined,41,47),
            new Room(true,true,false,false,50,47), new Room(false,true,true,true,undefined,49,52,51),
            new Room(false,false,true,false,undefined,undefined,50), new Room(true,false,false,true,53,undefined,undefined,50),
            new Room(true,true,true,true,57,52,58,54,new Goblin()), new Room(true,false,true,true,56,undefined,53,55), 
            new Room(false,false,true,false,undefined,undefined,54), new Room(false,true,false,false,undefined,54),
            new Room(false,true,false,false,undefined,53), new Room(true,false,true,true,59,undefined,60,53),
            new Room(false,true,false,false,undefined,58), new Room(true,false,false,true,61,undefined,undefined,58,new Goblin()),
            new Room(false,true,false,false,undefined,60)]
            step = 1
            l = 2500
            r = 2500
            time = 0
            moveBattlePlayer = -200
        }
    }
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
var thing = save.getItem('character')
console.log(thing)
