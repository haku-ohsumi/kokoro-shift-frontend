import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { GrCircleInformation } from "react-icons/gr";

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <GrCircleInformation
        onClick={() => navigate("/information")}
        className="information"
      />
      <h1 className="page-title">トップ画面</h1>
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