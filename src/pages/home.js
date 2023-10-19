import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div>
        <Link to="/admin/user/login">
          <button>オーナーログイン</button>
        </Link>
      </div>
      <div>
        <Link to="/staff/user/login">
          <button>スタッフログイン</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;