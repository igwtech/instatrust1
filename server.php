<?php
error_reporting(E_ERROR & ~E_DEPRECATED);
getState();
session_start();

function gameLogic() {
    global $estado;
    global $puntos;
    if(null!=$estado['player1'] && null!=$estado['player2']) { // Fin de match
        if($estado['player1']==$estado['player2']) 
            $result="Empate";
        else if($estado['player1']=='Piedra' &&  $estado['player2']=='scissors') {
            $result= "Gano Player 1";
            $puntos['player1']++;
        } else if($estado['player1']=='Tijera' &&  $estado['player2']=='paper') {
            $result= "Gano Player 1";
            $puntos['player1']++;
        } else if($estado['player1']=='Papel' &&  $estado['player2']=='rock') {
            $result= "Gano Player 1";
            $puntos['player1']++;
        } else {
            $result= "Gano Player 2";
            $puntos['player2']++;
        }
        //
        $_SESSION['endturn']=true;
        $_SESSION['turnos']++;
        if($_SESSION['turnos'] >=3 ) {
            $_SESSION['endgame'] = true;
        }
    }else if(null!=$estado['player1'] || null!=$estado['player2']) { // Espero por otro jugador
        $result= "Esperando por Jugador";
    }else { // Vacio
        $result= "Esperando por Jugadores";
    }
    return array($_SESSION['endturn'],$_SESSION['endgame'],$result,$flash);
}




function getState() {
    global $estado;
    global $puntos;
    if(!file_exists('cur_match.txt')|| !file_exists('points.txt')) {
        resetGame();
        return;
    }
    $estado = unserialize(file_get_contents('cur_match.txt'));
    $puntos = unserialize(file_get_contents('points.txt'));
}

function saveState() {
    global $estado;
    global $puntos;
    file_put_contents('cur_match.txt',serialize($estado));
    file_put_contents('points.txt',serialize($puntos));
}

function resetMatch() {
    global $estado;
    $estado=array('player1'=>null,'player2'=>null);
    
}

function resetGame() {
    global $puntos;
    global $estado;
    $estado=array('player1'=> null,'player2'=> null);
    $puntos=array('player1'=> 0,'player2'=> 0);
    $_SESSION['turnos']=0;
}

function recibirJugada($data) {
    global $estado;
    $estado[$data['player']] = $data['card'];
}

if($_SERVER['REQUEST_METHOD']=='POST') {
    error_log('Recibi post');
    $data = json_decode(file_get_contents('php://input'),true);
    recibirJugada($data);
} else if($_GET['reset']=='1') {
    resetGame();
    header('Location: /server.php');
} else {
    pintarTablero(gameLogic());
}


saveState();
function pintarTablero($board) {
    global $estado;
    global $puntos;
    list($endturn,$endgame,$result,$flash) = $board;
?>
<!DOCTYPE html>
<html>
    <head>
    <title>Rock, Paper, Scissors</title>
    <link rel="stylesheet" href="assets/styles.css"/>
    <meta http-equiv="refresh" content="5">
    </head>
    <body>
    <div class="container">
    <h1>BATTLE NOW!</h1>
    <h2>Player 1: <?php echo $puntos['player1'] ?>, Player 2: <?php echo $puntos['player2']?> </h2>
    <?php if($endturn):?>
    <div class="hand-options">
            <button class="hand" type="image" onclick="javascript:void();" style="background-image: url('assets/images/<?php echo $estado['player1']?>.png')"><?php echo $estado['player1']?></button>
            <button class="hand" type="image" onclick="javascript:void();" style="background-image: url('assets/images/<?php echo $estado['player2']?>.png')"><?php echo $estado['player2']?></button>
    </div>
        <h1><?php echo $result ?></h1>
        <h1><?php echo $flash ?></h1>
    <?php else: ?>
        <h1><?php echo $result ?></h1>
    <?php endif;?>
    </div>
    </body>
</html>
<?php 
    if( $_SESSION['endturn']==true ) {
        $_SESSION['endturn']=false;
        resetMatch();
    }
    if( $_SESSION['endgame'] == true ) {
        $_SESSION['endgame']=false;
        resetGame();
    }
}