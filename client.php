<?php
$playerid=$_GET['id'];
$options = [
    'rock',
    'paper',
    'scissors'
];

$draw=[];
for($i=0;$i<6;$i++) {
    foreach($options as $opt) {
        $draw[] =  $opt;
    }
}

$cards = [];
for($i=0;$i<3;$i++) {
    $pos = rand(0,count($draw)-1);
    $cards[]=$draw[$pos];
    array_splice($draw,$pos,1);
}

// pintar botones
// Con Ajax de accion
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Rock, Paper, Scissors</title>
        <script lang="javascript">
            var turnos=0;
            function jugar(el) {
                var xhr=new XMLHttpRequest();
                xhr.open('POST','server.php');
                xhr.send(JSON.stringify({
                    action: 'jugar',
                    player: 'player<?php echo $playerid; ?>',
                    card: el.innerText
                }));
                el.disabled=true;
                turnos++;
                if(turnos >= 3) {
                    setTimeout(function() {location.reload(); },1000);
                }
            }
        </script>
        <link rel="stylesheet" href="assets/styles.css"/>
    </head>
    <body>
        <div class="container">
        <h1><?php echo "Jugador $playerid"; ?></h1>
        <h2>Pick Your Play!</h2>
        <div class="hand-options">
            <button class="hand" type="image" onclick="jugar(this);" style="background-image: url('assets/images/<?php echo $cards[0]?>.png')"><?php echo $cards[0]?></button>
            <button class="hand" type="image" onclick="jugar(this);" style="background-image: url('assets/images/<?php echo $cards[1]?>.png')"><?php echo $cards[1]?></button>
            <button class="hand" type="image" onclick="jugar(this);" style="background-image: url('assets/images/<?php echo $cards[2]?>.png')"><?php echo $cards[2]?></button>
        </div>
        </div>
    </body>
</html>