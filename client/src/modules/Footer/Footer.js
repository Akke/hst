import React from "react";
import "./_Footer.scss";

export default(_ => {
	return (
		<div className="footer container">
			<div className="row">
				<div className="col-sm-6">
					<div className="font-weight-bold mb-2">2019-2020 &copy; herosiege.trade</div>
					<div>
						We are an independent marketplace fansite for <a href="https://store.steampowered.com/app/269210/Hero_Siege/" className="font-weight-bold">Hero Siege</a> where players can list their items for sale. 
						Hero Siege Trade simply serve as a middleman between the seller and the buyer, and have no authority to obtain any in-game data about our users inventories.
						<br/><br/>
						All assets from the game have been provided for limited use and belongs to <a href="http://www.panicartstudios.com/" className="font-weight-bold">Panic Art Studios</a>.
					</div>
				</div>

				<div className="col text-right">
					<a href="" className="mr-sm-3">Privacy Policy</a>
					<a href="" className="mr-sm-3">Terms of Service</a>
					<a href="">Contact</a>
				</div>
			</div>
		</div>
	);
});