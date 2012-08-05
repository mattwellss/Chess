// Chess.js
//
// requires:
//  Class.js,
//  ES5 functions:
//    forEach,
//    Object.create
//
var Class = (Class || {});
function sendMessage () {}
Number.prototype.inRange = function (bottom, top, b_include, t_include) {
  return this > bottom - (b_include || 0) && this < top + (t_include || 0);
};
var Chess = (function () {
  "use strict";
  var Board = (function () {
    var board = [];

    var letterToNumber = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
      F: 5,
      G: 6,
      H: 7
    };
    var translatePosition = function (fPosition) {
      return [
        letterToNumber[fPosition[0]],
        (fPosition[1] / 1) - 1
      ];
    };
    var unTranslatePosition = function (position) {
      return "ABCDEFGH"[position[0]] + (position[1] + 1);
    };
    var movePiece = function (piece, position) {
      position = translatePosition(position);
      var currentPosition = translatePosition(piece.position);
      var dX = position[0] - currentPosition[0];
      var dY = position[1] - currentPosition[1];

      // check if the move is legal according to piece's own rules
      if (piece.move(dX, dY) == false) {
        throw new IllegalMoveException(piece);
      }

      // walk the path that the piece will take, check for collisions
      var dirX = dX / (Math.abs(dX) || 1);
      var dirY = dY / (Math.abs(dY) || 1);
      while (dX || dY) {
        dX -= dX == 0? 0 : dirX;
        dY -= dY == 0? 0 : dirY;
        if (board[position[0] - dX][position[1] - dY].occupiedBy && !piece.jumps) {
          throw new PositionOccupiedException(piece);
        }
      }
      piece.position = unTranslatePosition(position);
      piece.movesTaken += 1;
      sendMessage("Moved " + piece.toString() + " to " + piece.position);

      board[currentPosition[0]][currentPosition[1]].occupiedBy = null;
      setPiece(piece);

      return position;
    };
    var setPiece = function (piece) {
      var position = translatePosition(piece.position);
      var square = board[position[0]][position[1]];
      square.occupiedBy = piece.id;
      square.type = piece.type;
      square.team = piece.team;
    };

    var width = 8;
    var height = 8;
    var i, c;
    for (i = 0; i < width; i += 1) {
      board[i] = [];
      for(c = 0; c < height; c += 1) {
        board[i][c] = {
          label: unTranslatePosition([i, c]),
          occupiedBy: null,
          type: null,
          team: null
        };
      }
    }

    return {
      board: board,
      translatePosition: translatePosition,
      unTranslatePosition: unTranslatePosition,
      movePiece: movePiece,
      setPiece: setPiece
    };
  }());

  var Piece = function Piece () {};
  Piece.prototype = Object.create(Class.prototype);
  Class.extend(Piece, {
    _PARENT: Piece,
    movesTaken: 0,
    move: {},
    name: null,
    jumps: false,
    attack: {},
    team: null,
    position: null,
    id: null,
    type: "Generic Chess Piece",
    toString: function () {
      return this.name;
    },
    init: function (team, position, id, name) {
      this.team = team;
      this.position = position;
      this.id = id;
      this.name = name;
    }
  });

  var Pawn = function Pawn () {};
  Pawn.prototype = Object.create(Piece.prototype);
  Class.extend(Pawn, {
    // _PARENT: Piece,
    forward: null,
    move: function (h, v) {
      // h MUST be 1 unless movesTaken is 0
      try {
        return (this.forward * v).inRange(0, 1 + (this.movesTaken == 0 || 0), false, true) &&
        !h;
      } catch (ex) {
        return false;
      }
    },
    attack: function (h, v) {
      // must be colliding...
      return false;
    },
    init: function (team, position, id, name) {
      this.forward = Board.translatePosition(position)[1] > 2?
        -1: 1;
      this._super(team, position, id, name);
    },
    type: "Pawn"
  });

  var Bishop = function Bishop () {};
  Bishop.prototype = Object.create(Piece.prototype);
  Class.extend(Bishop, {
    // _PARENT: Piece,
    move: function (h, v) {
      // move must be DIAGONAL and not ZERO
      return (Math.abs(h) == Math.abs(v)) && h != 0;
    },
    attack: function (h, v) {
      return this.move(h, v);
    },
    type: "Bishop"
  });

  var Rook = function Rook () {};
  Rook.prototype = Object.create(Piece.prototype);
  Class.extend(Rook, {
    move: function (h, v) {
      return (h != v) && h * v == 0;
    },
    attack: function (h, v) {
      return this.move(h, v);
    },
    type: "Rook"
  });

  var Knight = function Knight () {};
  Knight.prototype = Object.create(Piece.prototype);
  Class.extend(Knight, {
    jumps: true,
    move: function (h, v) {
      h = Math.abs(h);
      v = Math.abs(v);
      return (h + v == 3) && (Math.max(h, v) - Math.min(h, v) == 1);
    },
    attack: function (h, v) {
      return this.move(h, v);
    },
    type: "Knight"
  });

  var Queen = function Queen () {};
  Queen.prototype = Object.create(Piece.prototype);
  Class.extend(Queen, {
    move: function (h, v) {
      return Bishop.prototype.move(h, v) || Rook.prototype.move(h, v);
    },
    attack: function (h, v) {
      return this.move(h, v);
    },
    type: "Queen"
  });

  var King = function King () {};
  King.prototype = Object.create(Piece.prototype);
  Class.extend(King, {
    move: function (h, v) {
      h = Math.abs(h);
      v = Math.abs(v);
      return (h + v).inRange(0, 3) && Math.abs(h - v) < 2;
    },
    attack: function (h, v) {
      return this.move(h, v);
    },
    type: "King"
  });

  var Team = {
    pieces: {
      Pawn: 8,
      Rook: 2,
      Bishop: 2,
      Knight: 2,
      King: 1,
      Queen: 1
    },
    positions: {
      Pawn: [
        ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2"],
        ["A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7"]
      ],
      Rook: [
        ["A1", "H1"],
        ["A8", "H8"]
      ],
      Knight: [
        ["B1", "G1"],
        ["B8", "G8"]
      ],
      Bishop: [
        ["C1", "F1"],
        ["C8", "F8"]
      ],
      Queen: [["D1"], ["D8"]],
      King: [["E1"], ["E8"]]
    }
  };
  var Pieces = {};
  return {
    Board: Board,
    Pawn: Pawn,
    Bishop: Bishop,
    Rook: Rook,
    Knight: Knight,
    Queen: Queen,
    King: King,
    Pieces: Pieces,
    setup: function (teams) {
      var i;
      for (i = 0; i < teams.length; i ++) {
        var p = null;
        var team = teams[i];
        for (p in Team.pieces) {
          var l = Team.pieces[p];
          while(l--) {
            var piece = new this[p]();
            var position = Team.positions[p][i][l];
            var id = p + l + "_" + team.color;
            var name = (/(Queen|King)/).test(p) == false?
              team.color + "'s " + position[0] + "-" + p:
              team.color + "'s " + p;
            piece.init(team.color, position, id, name);
            Board.setPiece(piece);
            Pieces[piece.id] = piece;
            team.pieces.push(piece.id);
          }
        }
      }
    }
  };
}());



function PositionOccupiedException (value) {
  this.value = value;
  this.message = "The position on the board to which you tried to move was occupied!";
  this.toString = function () {
    return this.value + ": " + this.message;
  };
}
function IllegalMoveException (value) {
  this.value = value;
  this.message = "The piece you're moving cannot legally go in that position. Sorry.";
  this.toString = function () {
    return this.value + ": " + this.message;
  };
}

function setup () {
  team1 = {
    color: "Black",
    pieces: []
  };
  team2 = {
    color: "White",
    pieces: []
  };
  Chess.setup([team1, team2]);
}
