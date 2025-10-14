import React from 'react';
import bImg from '../assets/b.png';
import rImg from '../assets/r.png';
import oImg from '../assets/o.png';
import mImg from '../assets/m.png';
import iImg from '../assets/i.png';
import cImg from '../assets/c.png';
import hImg from '../assets/h.png';
import aImg from '../assets/a.png';
import tImg from '../assets/t.png';

import DashBoard from '../buttons/DashboardButton';
import Profile from '../buttons/ProfileButton';
import User from '../buttons/UserButton';
import LogoutButton from '../buttons/LogoutButton';
import SendMessageButton from '../buttons/SendMessageButton';
import FriendsButton from '../buttons/FriendsButton';
import ShopingButton from '../buttons/ShopingButton';
import VideoButton from '../buttons/VideoButton';
import GaleryButton from '../buttons/GaleryButton';
import SettingsButton from '../buttons/SettingsButton';
import NotificationButton from '../buttons/NotificationButton';
import GroupButton from '../buttons/GroupButton'; 

const Header = () => {
  const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

  return (
    <header className="bg-black text-white p-4 shadow-lg">
      <div className="flex flex-wrap justify-center md:justify-start items-center gap-1">
        {logoImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Letra ${index + 1}`}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-white shadow"
          />
        ))}
      </div>

      <nav className="mt-4 overflow-x-auto">
        <ul className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <li><DashBoard /></li>
          
          <li><Profile /></li>
          <li><SendMessageButton /></li>
          <li><GroupButton /></li>
          
          <li><VideoButton /></li>
          <li><GaleryButton /></li>
          
          <li><NotificationButton /></li>
          <li><SettingsButton /></li>
          <li><LogoutButton /></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
