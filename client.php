<?php
$playerid=$_GET['id'];
$options = [
    'Piedra',
    'Papel',
    'Tijera'
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
<h1><?php echo "Jugador $playerid"; ?></h1>
<button onclick="jugar(this);"><?php echo $cards[0]?></button>
<button onclick="jugar(this);"><?php echo $cards[1]?></button>
<button onclick="jugar(this);"><?php echo $cards[2]?></button>
