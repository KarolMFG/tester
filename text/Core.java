package Quarter1.falls;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Scanner;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;

public class Core{
	
	public static boolean finished = false;
	
	static MainFrame frame;
	
	public static void main(String[] args) {
		
		frame = new MainFrame();
		
		frame.setVisible(true);
		frame.setSize(640,360);
		frame.setLayout(null);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setTitle("Get to Cleveland");
		
		next(0);
		
	}
	
	// events are an int
	// -1: generic driving
	// 0: starting
	// 1: starting, refused (points to itself)
	// 2: leaving house
	// 3: stopping driving, side of road
	// 4: police encounter (chill)
	// 5: police encounter (not chill)
	// 6: police encounter end (chill)
	// 7: police encounter end (not chill)
	// 8: car chase
	// 9: game over (arrested)
	// 10: game over (dead)
	// 11: game over (crash)
	
	static int[] consequences = new int[] {-1, 1};
	
	public static float thirst = 0.2f;
	public static float hunger = 0.2f;
	public static float bladder = 0.2f;
	public static float energy = 0.8f;
	static float wantedness = 0;
	
	public static void next(int event) {
		// take action based on MainFrame.optionSelected
//		System.out.println(MainFrame.optionSelected);
//		System.out.println(MainFrame.lastText);
		
		if(MainFrame.lastText.contains("-thirst")) {
			thirst-=0.2f;
		}
		if(MainFrame.lastText.contains("-hunger")) {
			hunger-=0.2f;
		}
		if(MainFrame.lastText.contains("-bladder")) {
			bladder-=0.2f;
		}
		if(MainFrame.lastText.contains("+energy")) {
			energy+=0.2f;
			int occuringIndex = MainFrame.lastText.indexOf("+energy");// paste as needed
			while(MainFrame.lastText.charAt(occuringIndex-1)=='+') {// based on my formatting should never error
				occuringIndex--;
				energy+=0.15f;
			}
		}
		if(MainFrame.lastText.contains("-energy")) {
			energy-=0.2f;
			int occuringIndex = MainFrame.lastText.indexOf("-energy");// paste as needed
			while(MainFrame.lastText.charAt(occuringIndex-1)=='-') {// based on my formatting should never error
				if(occuringIndex == 0){break;}
				occuringIndex--;
				energy-=0.15f;
			}
		}
		
		float factor = (float)Math.random();
		energy*=0.95;energy-=0.03f*factor;
		energy=Math.max(0, energy);
		thirst+=0.05f*factor;
		hunger+=0.03f*factor;
		bladder+=0.01f*factor;
		wantedness-=0.01f*factor;
		wantedness=Math.max(0, wantedness);
		
		if(thirst > 1 || hunger > 1 || bladder > 1) {
			if(event == 1) {
				MainFrame.lastText += " Your indecision takes its toll.";
			}
			event = 10;
		}
		
		
		
		if(event == 8) {
			if(Math.random()<0.1) {
				MainFrame.lastText += " Somehow, you escaped. Congratulations!";
				event = -1;
			}
		}
		if(event == -1) {
			if(Math.random() > energy * 4) {// only happens at .25 energy or less
				MainFrame.lastText += " You've been dulled for a while now, and you can't focus. Suddenly, a tesla veers in front of you, no turn signal (Elon forgot to implement that), and everything goes black.";
				event = 10;
			}
		}
		
		
		String[] toShow = null;
		switch(event) {
		case 0: 
			toShow = new String[] {"What do you do?", "I decide to go. Why not?", "I stay. I don't think this is a good idea."};
			consequences = new int[] {2, 1};
			break;
		case 1:
			toShow = new String[] {"You can't shake the thought of leaving off your mind.", "I decide to go. Why not?", "I stay. I don't think this is a good idea."};
			if(		 Math.random()<0.3) {		 toShow[0] += " A car passes outside, and you wish you were in it.";
			}else if(Math.random()<0.3) {toShow[0] += " You hear talking in the street outside. Maybe those people are talking about leaving Falls Church, VA.";}
			consequences = new int[] {2, 1};
			break;
		case 2:
			toShow = new String[] {"You start to leave, in a hurry. You grab your wallet (+$20, +ID) and your keys. Right before you go, you remember:", "I should probably drink some water (-thirst).", "I should eat some food before I leave (-hunger).", "I should go to the bathroom (-bladder).", "Actually, I'm probably fine."};
			consequences = new int[] {-1, -1, -1, -1};
			break;
		case 3:
			if(Math.random()<0.2) {
				toShow = new String[] {"You are stopped on the side of the road. A cop car parks behind you, and you watch the officer approach.", "I stay in the car and scroll reels (+energy).", "I watch him approach, getting my ID ready.", "Once he leaves the car, I speed off onto the highway."};
				consequences = new int[] {(Math.random()<0.4 * (1+wantedness)?5:4), (Math.random()<0.2 * (1+wantedness)?5:4), (Math.random()<0.8?8:-1)};
			}else{
				toShow = new String[] {"You are stopped on the side of the road.", "Scroll a few reels while the officer walks over (++energy).", "I watch the cars drive by, entranced (+energy).", "I continue driving."};
				consequences = new int[] {3, 3, -1};
			}
			break;
		case 4:
			toShow = new String[] {"The officer stands by your door, and you lower the window. \n\"Good morning. I'm just wondering why you've stopped here.\" ", "I explain, telling the truth.", "I make up an excuse that sounds plausible.", "I speed off onto the highway."};
			consequences = new int[] {(Math.random()<0.1?7:6), (Math.random()<0.5?7:6), 8};
			break;
		case 5:
			toShow = new String[] {"The officer stands by your door, and you lower the window. \n\"Excuse me. Do you care to explain yourself? You're not exactly allowed to park here without reason.\" ", "I explain, telling the truth.", "I make up an excuse that sounds plausible.", "I speed off onto the highway."};
			consequences = new int[] {(Math.random()<0.3?7:6), (Math.random()<0.6?7:6), 8};
			break;
		case 6:
			toShow = new String[] {"The officer stands by your door. \n\"Alright. I'll just need your ID, and I'll leave you to it.\" ", "I show the officer my ID, and keep driving.", "I speed off onto the highway."};
			consequences = new int[] {-1, 8};
			break;
		case 7:
			if(wantedness<0.4) {
				toShow = new String[] {"The officer stands by your door. \n\"Really? I don't believe that. Show me your ID, and you'll get a warning.\"", "I show my ID without word, and drive off.", "I speed off onto the highway."};
				consequences = new int[] {-1, 8};
			}else if(wantedness<0.8) {
				toShow = new String[] {"The officer stands by your door. \n\"Really? I don't believe that. This isn't your first warning. That'll be a $10 fine, for now.\"", "I pay the $10 (-$10) fine, and drive off", "I speed off onto the highway."};
				consequences = new int[] {-1, 8};
			}else {
				toShow = new String[] {"The officer stands by your door. \n\"Sure, buddy. I'm afraid your repeated behavior is endangering others. Leave the car, you're under arrest.\"", "I do as the officer instructs.", "I speed off onto the highway."};
				consequences = new int[] {9, 8};
			}
			wantedness+=0.5f;
			break;
		case 8:
			toShow = new String[] {"You blast down the highway, the police officer in pursuit. If you are caught, you will never get to Cleveland.", "I keep driving (--energy).", "I glance at the police behind me (-energy).", "I practice explaining this incident to the judge (---energy).","I pull over."};
			int dO = (Math.random()<0.2 || energy < 0.3f?11:8);
			consequences = new int[] {dO, dO, dO, 9};
			break;
		case 9:
			toShow = new String[] {"You've been arrested. You are not getting to Cleveland."};
			break;
		case 10:
			toShow = new String[] {"You neglected yourself, and died. You are not getting to Cleveland."};
			break;
		case 11:
			toShow = new String[] {"As you drive, a tesla ahead of you veers into your lane without warning. You're not ready.\nYou played it too risky, and died. You are not getting to Cleveland."};
			break;
		default:
			toShow = new String[] {"You're driving to Cleveland.", "I drive, paying close attention (-energy).", "I drive, relaxed (+energy).", "I drive, scrolling reels (++energy).", "I make a stop by the side of the road."};
			consequences = new int[] {-1, (Math.random()<0.04?11:-1), (Math.random()<0.3?11:-1), 3};
			break;
		}
		toShow[0] = MainFrame.lastText + "\n" + toShow[0];
		frame.displayMenu(toShow);
		frame.writeStats();
	}
	
	
	
	
	
}
