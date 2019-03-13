<?php
error_reporting(E_ERROR & ~E_DEPRECATED);
getState();
session_start();

function gameLogic() {
    global $estado;
    global $puntos;
    if(null!=$estado['player1'] && null!=$estado['player2']) { // Fin de match
        if($estado['player1']==$estado['player2']) 
            echo "Empate";
        else if($estado['player1']=='Piedra' &&  $estado['player2']=='Tijera') {
            echo "Gano 1";
            $puntos['player1']++;
        } else if($estado['player1']=='Tijera' &&  $estado['player2']=='Papel') {
            echo "Gano 1";
            $puntos['player1']++;
        } else if($estado['player1']=='Papel' &&  $estado['player2']=='Piedra') {
            echo "Gano 1";
            $puntos['player1']++;
        } else {
            echo "Gano 2";
            $puntos['player2']++;
        }
        //
        $_SESSION['endturn']=true;
        $_SESSION['turnos']++;
        if($_SESSION['turnos'] >=3 ) {
            echo "<br>FIN DE JUEGO";
            $_SESSION['endgame'] = true;
        }
    }else if(null!=$estado['player1'] || null!=$estado['player2']) { // Espero por otro jugador
        echo "Esperando por Jugador";
    }else { // Vacio
        echo "Esperando por Jugadores";
    }
}

function pintarTablero() {
    global $estado;
    global $puntos;
    echo "<h1>Player 1: {$puntos['player1']}, Player 2: {$puntos['player2']} </h1>";
    echo "<h2>";
    
    echo "</h2>";
    echo '<meta http-equiv="refresh" content="5">';
    
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
    $estado=array('player1'=>null,'player2'=>null);
    $puntos=array('player1'=>0,'player2'=>0);
    $_SESSION['turnos']=0;
}
function recibirJugada($data) {
    global $estado;
    $estado[$data['player']]=$data['card'];
}


if($_SERVER['REQUEST_METHOD']=='POST') {
    error_log('Recbi post');
    $data = json_decode(file_get_contents('php://input'),true);
    recibirJugada($data);
}
else if($_GET['reset']=='1') {
    resetGame();
    header('Location: /server.php');
}else {
    pintarTablero();
    if($_SESSION['endturn']==true) {
        $_SESSION['endturn']=false;
        resetMatch();
    }
    if($_SESSION['endgame'] == true) {
        $_SESSION['endgame']=false;
        resetGame();
    }
}


saveState();

