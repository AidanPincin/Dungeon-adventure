const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
var up = false
var down = false
var right = false
var left = false
var page = 'start'
var step = 1
var roll = undefined
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
var gold = 0
const image = new Image()
image.src = "knight.png"
class Player{
    constructor(x, y){
        this.x = x
        this.y = y
    }

    blit(){
        if (up == true){this.y -= 10}
        if (down == true){this.y += 10}
        if (right == true){this.x += 10}
        if (left == true){this.x -= 10}
        ctx.drawImage(image, this.x, this.y)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(5,5,200,25)
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(5,5,(hp/max_hp)*200,25)
        ctx.fillStyle = '#000000'
        ctx.font = '17px Arial'
        ctx.fillText(Math.ceil(hp)+"/"+max_hp, 215, 25)
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
const statButtons = [new Button(250,500,150,25,'Strength',24), new Button(450,500,150,25,'Intelligence',24), new Button(650,500,150,25,'Dexterity',24), new Button(850,500,150,25,'Constitution',24), new Button(1050,500,150,25,'Wisdom',24), new Button(1250,500,150,25,'Perception',24), new Button(1450,500,150,25,'Charisma',24)]
const nextButton = new Button(923,660,66,25,'Next',24)
const startButtons = [new Button(905, 440, 100, 25, 'Play', 24), new Button(905, 480, 150, 25, 'Instructions', 24)]
const instructButton = new Button(923,660,66,25,'Back',24)
const mainButton = new Button(300,5,66,25, 'Menu', 24)
const menuButtons = [new Button(905,400,100,25, 'Resume', 24), new Button(905,435,100,25, 'Settings', 24)]
const optionButtons = [new Button(923,660,66,25, 'Back', 24)]
var player = new Player(935,515)
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
        player.blit()
        mainButton.blit()
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
    requestAnimationFrame(update)
}
update()
window.addEventListener('keydown', function(e){
    if (e.key == 'w'){up = true}
    if (e.key == 's'){down = true}
    if (e.key == 'd'){right = true}
    if (e.key == 'a'){left = true}
})
window.addEventListener('keyup', function(e){
    if (e.key == 'w'){up = false}
    if (e.key == 's'){down = false}
    if (e.key == 'd'){right = false}
    if (e.key == 'a'){left = false}
})
function onClick(e){
    if (page == 'main'){
        const clickedButton = mainButton.wasClicked(e)
        if (clickedButton != undefined){
            setTimeout(() => {page = 'menu'}, 250)
        }
    }
    else if (page == 'menu'){
        const clickedButton = menuButtons.find((b) => b.wasClicked(e))
        if (clickedButton != undefined){
            if (clickedButton.text == 'Resume'){
                setTimeout(() => {page = 'main'}, 250)
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
                setTimeout(() => {nextButton.text = 'Begin'}, 250)
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
}
window.addEventListener('click', onClick)