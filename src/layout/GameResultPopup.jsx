// GameResultPopup.jsx
import PropTypes from 'prop-types';

const GameResultPopup = ({ result, onHome, onNewGame }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-80 md:w-96 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Ván Cờ Kết Thúc</h2>
          <p className="text-lg text-center mb-6">{result}</p>
          <div className="flex space-x-4">
            <button onClick={onHome} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Trang chủ</button>
            <button onClick={onNewGame} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Ván mới</button>
          </div>
        </div>
      </div>
    );
  };

  GameResultPopup.propTypes = {
    result: PropTypes.string.isRequired,
    onHome: PropTypes.func.isRequired,
    onNewGame: PropTypes.func.isRequired,
  };

  export default GameResultPopup;
