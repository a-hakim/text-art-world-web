//Bookklik Technologies
//Created by Abdul Hakim bin Mohd Noor

#include <iostream>
#include <string>
#define _WIN32_WINNT 0x0500
#include <Windows.h>
#include <cstdlib> 

using namespace std;

//DECLARE GLOBAL VARIABLES
bool
//END/CLOSE GAME?
quit;
char
//NAME
enemy_name[48],
player_name[48];
int
//PLAYER VAR
player_health,
player_gold,
player_level,
player_attack,
//ENEMY VAR
enemy_health,
enemy_attack,
enemy_reward;



//FUNCTIONS :
//STAND BY LOADING
void stand_by()
{
	int xload = 0;
	do
	{
		Sleep(0025); cout << ">";
		Sleep(0025); cout << "<";
		xload = xload + 1;
	} while (xload != 17);
	Sleep(0500);
}
//GAME HEADLINE
void headline()
{
	cout << "\n";
	cout << " T E X T   A R T   W O R L D      " << endl;
	cout << " ================================ " << endl;
	cout << "                VERSION : SEPT'18 " << endl;
	cout << "\n";
}
//OPENING
void opening()
{
	char get_name[48];

	system("color 5F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "| Please insert your name below  |" << endl;
	cout << "++------------------------------++" << endl;
	cout << ">> "; cin.ignore(); cin.getline(get_name, 48);

	//COPY THE INPUT GLOBAL VAR
	strcpy(player_name, get_name);

	cout << "++------------------------------++" << endl;
	cout << "||       Processing . . .       ||" << endl;
	cout << "++------------------------------++" << endl;
	stand_by();

	system("CLS");
}
//PRINT STATE
void print_state(int& player_health, int& player_gold, int& player_level, int& player_attack, int& enemy_health, int& enemy_attack, int& enemy_reward)
{
	cout << "+----------------+---------------+" << endl;
	cout << "|                |               |" << endl;
	cout << "| PLAYER         | MONSTER       |" << endl;
	cout << "|                |               |" << endl;
	cout << "+----------------+---------------+" << endl;
	cout << "| Health : " << player_health << "\t | Health : " << enemy_health << "\t |" << endl;
	cout << "| Gold   : " << player_gold   << "\t | Attack : " << enemy_attack << "\t |" << endl;
	cout << "| Level  : " << player_level  << "\t | Gold   : " << enemy_reward << "\t |" << endl;
	cout << "| Attack : " << player_attack << "\t | Reward   \t |" << endl;
	cout << "++---------------+--------------++" << endl;
}
//PLAYER OPERATION
void player_operation(int& player_health, int& player_gold, int& player_level, int& player_attack)
{
	//PLAYER HEALTH
	if (player_health > 100)
	{
		player_health = 100;
	}
	if (player_health <= 0)
	{
		player_health = 0;
	}

	//GOLD X LEVEL
	if (player_gold >= 25)
	{
		player_level = 2;
	}
	if (player_gold >= 50)
	{
		player_level = 3;
	}
	if (player_gold >= 100)
	{
		player_level = 4;
	}

	//LEVEL X ATTACK
	if (player_level == 2)
	{
		player_attack = 10;
	}
	if (player_level == 3)
	{
		player_attack = 15;
	}
	if (player_level == 4)
	{
		player_attack = 20;
	}
}
//EXCUTE PLAYER STEP
void player_battle(int& enemy_health, int& enemy_attack, int& player_gold, int& player_attack, int& player_health)
{
	//PLAYER SHALL DECIDE TO ATTACK?
	stand_by();
	string atk;
	cout << "\n";
	cout << "++------------------------------++" << endl;
	cout << "|| What you want to do ?        ||" << endl;
	cout << "|| A - Attack                   ||" << endl;
	cout << "|| H - Healing +10      [LVL 2] ||" << endl;
	cout << "|| P - Poison Enemy     [LVL 4] ||" << endl;
	cout << "++------------------------------++" << endl;
	player_atk:
	cout << ">> Input : ";
	cin  >> atk;

	//ENTER YES TO ATTACK, ENEMY HEALTH DECREASE BY PLAYER ATTACK
		if (atk == "attack" || atk == "ATTACK" || atk == "Attack" || atk == "A" || atk == "a")
		{
			enemy_health = enemy_health - player_attack;
			cout << "++------------------------------++" << endl;
			cout << "||     Player attacking !!!     ||" << endl;
			cout << "++------------------------------++" << endl;
			stand_by();
			system("CLS");
		}
		else if (atk == "healing" || atk == "HEALING" || atk == "Healing" || atk == "H" || atk == "h" && player_level >= 2)
		{
			player_health = player_health + 10;
			cout << "++------------------------------++" << endl;
			cout << "||       Calm and Healing       ||" << endl;
			cout << "++------------------------------++" << endl;
			stand_by();
			system("CLS");
		}
		else if (atk == "Poison" || atk == "POISON" || atk == "poison" || atk == "P" || atk == "p" && player_level >= 4)
		{
			player_gold = player_gold - 20;
			enemy_attack = enemy_attack - 2;
			cout << "++------------------------------++" << endl;
			cout << "||            Poison            ||" << endl;
			cout << "++------------------------------++" << endl;
			stand_by();
			system("CLS");
		}
		else if (atk == "dbg.afif")
		{
			enemy_health = enemy_health - 50;
			cout << "++------------------------------++" << endl;
			cout << "||    SPECIAL ATTACK USED !!!   ||" << endl;
			cout << "||      >>> DEBUG ENEMY <<<     ||" << endl;
			cout << "++------------------------------++" << endl;
			stand_by();
			system("CLS");
		}
		else if (atk == "dbg.hakim")
		{
			player_health = player_health + 50;
			cout << "++------------------------------++" << endl;
			cout << "||    SPECIAL ATTACK USED !!!   ||" << endl;
			cout << "||      >>> DEBUG PLAYER <<<    ||" << endl;
			cout << "++------------------------------++" << endl;
			stand_by();
			system("CLS");
		}
		else
		{
			cout << "++------------------------------++" << endl;
			cout << "||         Invalid Input        ||" << endl;
			cout << "++------------------------------++\a" << endl;
			goto player_atk;
		}
}
//EXCUTE ENEMY STEP
void enemy_battle(int& player_health, int& enemy_attack)
{
	//PLAYER HEALTH DECREASE BY ENEMY ATTACK
	player_health = player_health - enemy_attack;
	stand_by();
	cout << "\n";
	cout << "++------------------------------++" << endl;
	cout << "||      Enemy attacking !!!     ||" << endl;
	cout << "++------------------------------++" << endl;
	stand_by();
	system("CLS");
}
//BATTLE SIMULATION
void battle_function()
{
	do {
		//STEP001:ENEMY ATTACK
		system("color 4F");
		headline();
		cout << ">> Monster " << enemy_name << "'s turn :" << endl;
		player_operation(player_health, player_gold, player_level, player_attack);
		print_state(player_health, player_gold, player_level, player_attack, enemy_health, enemy_attack, enemy_reward);
		enemy_battle(player_health, enemy_attack);

		//STEP002:CHECK VARIABLES
		player_operation(player_health, player_gold, player_level, player_attack);
		if (player_health>0)
		{}
		if (player_health <= 0)
		{
			system("color 1F");
			headline();
			cout << "++------------------------------++" << endl;
			cout << "||         GAME OVER !!!        ||" << endl;
			cout << "++------------------------------++" << endl;
			stand_by();
			cout << "\n";
			print_state(player_health, player_gold, player_level, player_attack, enemy_health, enemy_attack, enemy_reward);
			cout << ">> "; system("PAUSE");
			system("CLS");
			quit = true;
			break;
		}

		//STEP003:PLAYER ATTACK?
		system("color 2F");
		headline();
		cout << ">> Player " << player_name << "'s turn :" << endl;
		print_state(player_health, player_gold, player_level, player_attack, enemy_health, enemy_attack, enemy_reward);
		player_battle(enemy_health, enemy_attack, player_gold, player_attack, player_health);

		//STEP004:CHECK VARIABLES
		if (enemy_health>0)
		{}
		if (enemy_health <= 0)
		{
			enemy_health = 0;
			player_gold += enemy_reward;
			player_health += enemy_reward / 2;
			player_operation(player_health, player_gold, player_level, player_attack);
			system("CLS");

			system("color 1F");
			headline();
			cout << ">> Battle Result :" << endl;
			cout << "++------------------------------++" << endl;
			cout << "||      THE ENEMY DEAD !!!      ||" << endl;
			cout << "++------------------------------++" << endl;
			stand_by();
			cout << "\n";
			cout << "++------------------------------++" << endl;
			cout << "||            Reward            ||" << endl;
			cout << "++------------------------------++" << endl;
			cout << ">> You received :"<< endl;
			cout << ">> " << enemy_reward << "+ gold and " << enemy_reward / 2 << "+ health" << endl;
			print_state(player_health, player_gold, player_level, player_attack, enemy_health, enemy_attack, enemy_reward);
			cout << ">> "; system("PAUSE");
			system("CLS");
			break;
		}
	} while (enemy_health != 0);
}


//USER INTERFACE :
//MAIN MENU
void ui_main_menu()
{
	main_screen:
	int input;
	system("color 5F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|         1. Start Game          |" << endl;
	cout << "|         2. About               |" << endl;
	cout << "|         3. Credits             |" << endl;
	cout << "|         4. Quit                |" << endl;
	cout << "|                                |" << endl;
	cout << "+--------------------------------+" << endl;
	option:
	cout << ">> Input : ";
	cin >> input;

	if (input == 1)
	{
		cout << "++------------------------------++" << endl;
		cout << "||       Processing . . .       ||" << endl;
		cout << "++------------------------------++" << endl;
		stand_by();
		quit = false;
	}
	else if (input==2)
	{
		//LOADING
		cout << "++------------------------------++" << endl;
		cout << "||       Processing . . .       ||" << endl;
		cout << "++------------------------------++" << endl;
		stand_by(); 
		system("CLS");

		//PRINT OUT ABOUT SCREEN
		system("color 5F");
		headline();
		cout << "+--------------------------------+" << endl;
		cout << "|             ABOUT              |" << endl;
		cout << "+--------------------------------+" << endl;
		cout << "| T.A.W : Text Art World.        |" << endl;
		cout << "| Version 3.12.15 Update U5.     |" << endl;
		cout << "| Copyright 2018 Bookklik Tech.  |" << endl;
		cout << "| All rights reserved.           |" << endl;
		cout << "+--------------------------------+" << endl;
		cout << ">> ";
		system("PAUSE");
		system("CLS");

		//RETURN TO MAIN SCREEN
		goto main_screen;

	}
	else if (input == 3)
	{
		//LOADING
		cout << "++------------------------------++" << endl;
		cout << "||       Processing . . .       ||" << endl;
		cout << "++------------------------------++" << endl;
		stand_by();
		system("CLS");

		//PRINT OUT ABOUT SCREEN
		system("color 5F");
		headline();
		cout << "+--------------------------------+" << endl;
		cout << "|            CREDITS             |" << endl;
		cout << "+--------------------------------+" << endl;
		cout << "|     T.A.W : Text Art World     |" << endl;
		cout << "|                                |" << endl;
		cout << "|  #Project Creator              |" << endl;
		cout << "| >----------------------------< |" << endl;
		cout << "|   Bookklik Technologies        |" << endl;
		cout << "|                                |" << endl;
		cout << "|  #Main Producer                |" << endl;
		cout << "| >----------------------------< |" << endl;
		cout << "|   A.Hakim Noor                 |" << endl;
		cout << "+--------------------------------+" << endl;
		cout << ">> ";
		system("PAUSE");
		system("CLS");

		//RETURN TO MAIN SCREEN
		goto main_screen;

	}
	else if (input == 4)
	{
		cout << "++------------------------------++" << endl;
		cout << "||       Processing . . .       ||" << endl;
		cout << "++------------------------------++" << endl;
		stand_by();
		quit = true;
	}
		else if (cin.fail())
	{
		cin.clear();
		cin.ignore(80, '\n');
		cout << "++------------------------------++" << endl;
		cout << "||         Invalid Input        ||" << endl;
		cout << "++------------------------------++\a" << endl;
		goto option;
	}
	else 
	{
		cout << "++------------------------------++" << endl;
		cout << "||         Invalid Input        ||" << endl;
		cout << "++------------------------------++\a" << endl;
		goto option;
	}
	system("CLS");
}
//START BATTLE
void ui_start_battle()
{
	system("color 1F");
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|          BATTLE START          |" << endl;
	cout << "|                                |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}
//ENDED BATTLE
void ui_ended_battle()
{
	system("color 1F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|          BATTLE ENDED          |" << endl;
	cout << "|                                |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}
//CHAPTER 1
void ui_chapter_01()
{
	system("color 1F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|            CHAPTER 1           |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|           1st Battle           |" << endl;
	cout << "|                                |" << endl;
	cout << "|    Player VS Monster Sap-an    |" << endl;
	cout << "|                                |" << endl;
	cout << "|              TIPS              |" << endl;
	cout << "| >----------------------------< |" << endl;
	cout << "|  Always remember  that  enemy  |" << endl;
	cout << "|  will attack you first before  |" << endl;
	cout << "|  you  able  to  counter back.  |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}
//CHAPTER 2
void ui_chapter_02()
{
	system("color 1F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|            CHAPTER 2           |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|           2nd Battle           |" << endl;
	cout << "|                                |" << endl;
	cout << "|    Player VS Monster Eim-an    |" << endl;
	cout << "|                                |" << endl;
	cout << "|              TIPS              |" << endl;
	cout << "| >----------------------------< |" << endl;
	cout << "|  OPTION : H - Healing +10      |" << endl;
	cout << "|  This option is available for  |" << endl;
	cout << "|  player with lvl 2 and above.  |" << endl;
	cout << "|  Its help  increase health by  |" << endl;
	cout << "|  10.                           |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}
//CHAPTER 3
void ui_chapter_03()
{
	system("color 1F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|            CHAPTER 3           |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|           3rd Battle           |" << endl;
	cout << "|                                |" << endl;
	cout << "|   Player VS Monster Sham-an    |" << endl;
	cout << "|                                |" << endl;
	cout << "|              TIPS              |" << endl;
	cout << "| >----------------------------< |" << endl;
	cout << "|  Increase your gold to  level  |" << endl;
	cout << "|  up and increase  your attack  |" << endl;
	cout << "|  power.                        |" << endl;
	cout << "|  ____________________________  |" << endl;
	cout << "|  Gold   |   Level   |  Attack  |" << endl;
	cout << "|  >=25   |     2     |    10    |" << endl;
	cout << "|  >=50   |     3     |    15    |" << endl;
	cout << "|  >=100  |     4     |    20    |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}
//CHAPTER 4
void ui_chapter_04()
{
	system("color 1F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|            CHAPTER 4           |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|           4th Battle           |" << endl;
	cout << "|                                |" << endl;
	cout << "|    Player VS Monster Zak-un    |" << endl;
	cout << "|                                |" << endl;
	cout << "|              TIPS              |" << endl;
	cout << "| >----------------------------< |" << endl;
	cout << "|  OPTION : P - Poison enemy     |" << endl;
	cout << "|  This option is available for  |" << endl;
	cout << "|  player with lvl 4 and above.  |" << endl;
	cout << "|  It will taking 20 golds from  |" << endl;
	cout << "|  player  and  shall  decrease  |" << endl;
	cout << "|  enemy attack by 2.            |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}
//CHAPTER 5
void ui_chapter_05()
{
	system("color 1F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|            CHAPTER 5           |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "|           5th Battle           |" << endl;
	cout << "|                                |" << endl;
	cout << "|    Player VS Monster B.Pax     |" << endl;
	cout << "|                                |" << endl;
	cout << "|              TIPS              |" << endl;
	cout << "| >----------------------------< |" << endl;
	cout << "|  Over use option : P - Poison  |" << endl;
	cout << "|  will consume amount of golds  |" << endl;
	cout << "|  and once  player's gold less  |" << endl;
	cout << "|  100, player lvl  will return  |" << endl;
	cout << "|  to lvl 3 and no longer  able  |" << endl;
	cout << "|  to use the option anymore.    |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}
//ENDING
void ui_ending()
{
	//CALCULATE SCORE
	int score_total = (player_health*2)+player_gold;

	//PRINT OUT
	system("color 5F");
	headline();
	cout << "+--------------------------------+" << endl;
	cout << "|       CONGRATULATION !!!       |" << endl;
	cout << "+--------------------------------+" << endl;
	cout << "|                                |" << endl;
	cout << "| You have defeated all monster  |" << endl;
	cout << "|                                |" << endl;
	cout << "|           CHEAT CODE           |" << endl;
	cout << "| >----------------------------< |" << endl;
	cout << "| dbg.hakim - player health +50  |" << endl;
	cout << "|  dbg.afif - enemy health -50   |" << endl;
	cout << "++------------------------------++" << endl;
	cout << ">> Your total score : " << score_total << endl;
	cout << "++------------------------------++" << endl;
	cout << "||   Thanks you for playing     ||" << endl;
	cout << "++------------------------------++" << endl;
	cout << ">> "; system("PAUSE");
	system("CLS");
}


//MAIN OPERARION :
void main()
{
	//SET WINDOWS CONSOLE SIZE
	HWND console = GetConsoleWindow();
	RECT r;
	GetWindowRect(console, &r);
	MoveWindow(console, r.left, r.top, 305, 480, TRUE);


	//MAIN MENU
	start_point:
	ui_main_menu();

	//QUIT OPTION
	if (quit == true)
	{
		goto exit;
	}
	opening();

	//PLAYER INITIAL VARIABLE VALUE
	player_health = 100;
	player_gold = 10;
	player_level = 1;
	player_attack = 5;

	/*
	ARRAY MONSTER TYPE:
	0=MONSTER 1
	1=MONSTER 2
	2=MONSTER 3
	3=MONSTER 4
	4=MONSTER 5
	*/
	int monster_health[] = { 20, 30, 45, 60, 70 };
	int monster_attack[] = {  4,  6,  8, 12, 16 };
	int monster_reward[] = { 20, 30, 40, 60, 80 };


	/****************************************************/

	//CHAPTER 1
	ui_chapter_01();

	//INSTALL MONSTER 1 INTO ENEMY FUNCTION
	enemy_health = monster_health[0];
	enemy_attack = monster_attack[0];
	enemy_reward = monster_reward[0];
	strcpy(enemy_name, "Sap-an");

	//BATTLE STAGE
	headline();
	cout << ">> Level 1 : \n";
	ui_start_battle();
	battle_function();

	//GAME OVER AND EXIT
	if (quit == true)
	{
		goto start_point;
	}

	//BATTLE ENDED AND CONTINUE
	ui_ended_battle();

	/****************************************************/

	//CHAPTER 2
	ui_chapter_02();

	//INSTALL MONSTER 2 INTO ENEMY FUNCTION
	enemy_health = monster_health[1];
	enemy_attack = monster_attack[1];
	enemy_reward = monster_reward[1];
	strcpy(enemy_name, "Eim-an");

	//BATTLE STAGE
	headline();
	cout << ">> Level 2 : \n";
	ui_start_battle();
	battle_function();

	//GAME OVER AND EXIT
	if (quit == true)
	{
		goto start_point;
	}

	//BATTLE ENDED AND CONTINUE
	ui_ended_battle();

	/****************************************************/

	//CHAPTER 3
	ui_chapter_03();

	//INSTALL MONSTER 3 INTO ENEMY FUNCTION
	enemy_health = monster_health[2];
	enemy_attack = monster_attack[2];
	enemy_reward = monster_reward[2];
	strcpy(enemy_name, "Sham-an");

	//BATTLE STAGE
	headline();
	cout << ">> Level 3 : \n";
	ui_start_battle();
	battle_function();
	
	//GAME OVER AND EXIT
	if (quit == true)
	{
		goto start_point;
	}

	//BATTLE ENDED AND CONTINUE
	ui_ended_battle();

	/****************************************************/

	//CHAPTER 4
	ui_chapter_04();

	//INSTALL MONSTER 4 INTO ENEMY FUNCTION
	enemy_health = monster_health[3];
	enemy_attack = monster_attack[3];
	enemy_reward = monster_reward[3];
	strcpy(enemy_name, "Zak-un");

	//BATTLE STAGE
	headline();
	cout << ">> Level 4 : \n";
	ui_start_battle();
	battle_function();
	
	//GAME OVER AND EXIT
	if (quit == true)
	{
		goto start_point;
	}

	//BATTLE ENDED AND CONTINUE
	ui_ended_battle();

	/****************************************************/

	//CHAPTER 5
	ui_chapter_05();

	//INSTALL MONSTER 5 INTO ENEMY FUNCTION
	enemy_health = monster_health[4];
	enemy_attack = monster_attack[4];
	enemy_reward = monster_reward[4];
	strcpy(enemy_name, "B.Pax");

	//BATTLE STAGE
	headline();
	cout << ">> Level 5 : \n";
	ui_start_battle();
	battle_function();

	//GAME OVER AND EXIT
	if (quit == true)
	{
		goto start_point;
	}

	//BATTLE ENDED AND CONTINUE
	ui_ended_battle();

	/****************************************************/

	//ENDING
	ui_ending();
	goto start_point;

	//QUIT
	exit:
	headline();

}