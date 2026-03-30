import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const App = () => {

  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState('X');

  const checkWinner = () => {
    const lines = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,3,6],
      [1,4,7],
      [2,5,8],
      [0,4,8],
      [2,4,6]
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a,b,c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const winner = checkWinner();

  const handlePress = (index: number) => {

    if (board[index] !== null || winner) return;

    const newBoard = [...board];
    newBoard[index] = player;

    setBoard(newBoard);
    setPlayer(player === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setPlayer('X');
  };

  const isBoardFull = board.every(cell => cell !== null);

  // الصفحة الأولى
  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setGameStarted(true)}
        >
          <Text style={styles.startText}>Commencez</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // صفحة اللعبة
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Tic Tac Toe</Text>

      <View style={styles.board}>
        {board.map((value, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cell}
            onPress={() => handlePress(index)}
          >
            <Text style={styles.cellText}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.result}>
        {winner
          ? `Winner: ${winner}`
          : isBoardFull
          ? "Draw"
          : `Turn: ${player}`}
      </Text>

      {(winner || isBoardFull) && (
        <TouchableOpacity style={styles.restartButton} onPress={resetGame}>
          <Text style={styles.restartText}>Restart Game</Text>
        </TouchableOpacity>
      )}

    </View>
  );
};

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  title:{
    fontSize:35,
    marginBottom:30
  },

  board:{
    width:300,
    flexDirection:'row',
    flexWrap:'wrap'
  },

  cell:{
    width:100,
    height:100,
    borderWidth:2,
    justifyContent:'center',
    alignItems:'center'
  },

  cellText:{
    fontSize:40
  },

  result:{
    marginTop:20,
    fontSize:20
  },

  startButton:{
    backgroundColor:'green',
    padding:15,
    borderRadius:10
  },

  startText:{
    color:'white',
    fontSize:20
  },

  restartButton:{
    marginTop:20,
    backgroundColor:'black',
    padding:10,
    borderRadius:5
  },

  restartText:{
    color:'white',
    fontSize:18
  }

});

export default App;
