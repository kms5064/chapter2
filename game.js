import chalk from "chalk";
import readlineSync from "readline-sync";

class Player {
  //클래스 배정, 껍데기만 있는거
  constructor(hp, atk) {
    this.hp = hp;
    this.atk = atk;
    this.randomDmg = 0;  //데미지 변동
    this.def = 0;  //방어 로직, 60%확률로 1이면 방어 성공, 0이면 실패  기본값 0
    this.revive = 0; //1스테이지 클리어 시 얻는 부활 로직 1이면 1번 부활 가능 (사용시 0)
    this.drain = 0; //흡혈 획득! 뱀파이어 사냥후 스킬 획득시 1로 변경, 1일때 10%흡혈
    this.skill = 0; //'마탄' 획득! 마족병사 사냥 후 스킬 획득시 1로 변경
    this.skillDmg = 20; // 마탄 데미지
    this.passive = 0; //'저주' 획득! 듀라한 사냥 후 스킬 획득시 1로 변경
    this.doubleAtk = 0; //'묘목'획득! 트리가드 사냥 후 스킬 획득시 1로 변경
    this.anger = 0; //'분노' 획득 치명타 피해를 입혔을 때, 적을 한턴 행동불능에 빠뜨립니다!
  }

  attack(monster) {  //공격 메서드
    // 플레이어의 공격
    const critical = Math.random() < 0.1; //크리티컬 확률 10%
    const doubleAttack = Math.random() < 0.3;

    if (critical) {
      this.randomDmg = (this.atk - 5 + Math.floor(Math.random() * 11) * 2);  //크리티컬! 근데 이거  UI엔 어떻게 표기하지...
      if (this.anger = 1) { //분노 : 크리시 적 기절
        monster.ready1 =1;
      }
    } else {
      this.randomDmg = this.atk - 5 + Math.floor(Math.random() * 11); //노크리 평타
    }

    monster.hp -= this.randomDmg;  //딜!


    if (this.drain === 1) { //흡혈기믹
      this.hp += Math.round(this.randomDmg / 10)
    }

    if (doubleAttack) {  //묘목 추가타 이것도 UI에 표시하고싶은데....
      if (this.doubleAtk === 1) {
        monster.hp -= Math.round(this.randomDmg / 2);
      }
    }


  }

  defence(monster) {  //방어 메서드
    const defenceRate = Math.random() < 0.6;
    if (defenceRate) {
      this.def = 1;
    }
  }

  magic(monster) { // 마탄 메서드
    const critical = Math.random() < 0.1; //크리티컬 확률 10%

    if (critical) {
      monster.hp -= (this.skillDmg * 2);  //크리티컬! 근데 이거  UI엔 어떻게 표기하지...
    } else {
      monster.hp -= this.skillDmg
    }

  }
}

class Monster {
  constructor(name, hp, atk) {
    this.name = name;
    this.hp = hp;
    this.atk = atk;
    this.randomDmg = 0;
    this.attackTurn = 0; //공격 패턴
    this.cur = 10; // 5, 10 스테이지에서, 10턴 후 즉사
    this.ready1 = 0;  //트리가드 평타, 마법사 스턴,   정예병 스턴, 여기사 스턴, 마왕 스턴
    this.ready2 = 0;  //트리가드 속박, 마법사 공격,   정예병 찍기, 여기사 강공
    this.ready3 = 0;  //              마법사 메테오, 정예병 분노
  }

  attack(player) {
    // 몬스터의 공격
    this.randomDmg = this.atk - 5 + Math.floor(Math.random() * 11);
    player.hp -= this.randomDmg;
  }

  randomPattern(player) {
    if (Math.random() < 0.3) { // 30%
      this.attackTurn = 0
    } else if (Math.random() < 0.6) { // 30%
      this.attackTurn = 1
    } else if (Math.random() < 0.8) { // 20%
      this.attackTurn = 2
    } else if (Math.random() < 1) { // 20%
      this.attackTurn = 3
    }
  }

  curse(player) {
    this.cur -= 1;
  }
}



function displayStatus(stage, player, monster) {
  //인터페이스 노출
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) + //스테이지 번호
    chalk.blueBright(
      `| 플레이어  hp: ${player.hp} ATK: ${player.atk}` //플레이어 정보
    ) +
    chalk.redBright(
      `| ${monster.name}  hp: ${monster.hp} ATK: ${monster.atk}` //몬스터 정보
    )
  );
  console.log(chalk.magentaBright(`=====================\n`));
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const battle = async (stage, player, monster) => {
  //전투
  let logs = []; //전투로그 배열 정의 -> 여기는 clear되지 않음

  while (player.hp > 0) {
    //플레이어 hp가 살아있을때 반복
    console.clear();
    displayStatus(stage, player, monster); //바로 위의 인터페이스 노출 함수

    logs.forEach((log) => console.log(log)); //전투로그 반복 => 선택지 제시
    // 새로운 스킬 생기면 여기에 if 넣어서 추가
    if (player.skill === 1) {
      console.log(chalk.green(
        `\n1. 휘두르기. 2. 구르기. 3. 방어하기. 4. 마탄공격 9. 스테이지 스킵. 0. 도망치기.`
      )
      );
    } else {
      console.log(chalk.green(
        `\n1. 휘두르기. 2. 구르기. 3. 방어하기. 9. 스테이지 스킵. 0. 도망치기.`
      )
      );
    }
    const choice = readlineSync.question("당신의 선택은? "); //선택 받음
    logs = []; // logs가 너무 길어지면 다시 부활시킬수도

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`)); //logs(전투로그)에 choice push

    // if (choice === "1") {}  :  처음 제시했던 방법 : 항목이 많아질수록 관리가 힘들고 복잡해짐
    if (stage === 1) {
      //stage 1 전투 진행
      switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {
        case "1":
          player.attack(monster); // 플레이어 공격
          logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
          if (monster.hp <= 0) {
            break;
          }
          monster.attack(player); // 몬스터 공격
          logs.push(chalk.red(`'${monster.name}'이 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
          break;

        case "2":
          logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
          logs.push(chalk.red(`'${monster.name}'의 공격이 허공을 갈랐습니다!`));
          break;

        case "3":
          logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
          player.defence(monster);
          if (player.def === 1) {
            logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
            player.def = 0;
            break;
          } else if (player.def === 0) {
            monster.attack(player);
            logs.push(chalk.red(`방어 실패! '${monster.name}'이 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            break;
          }

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }
    if (stage === 2) {
      //stage 2 전투 진행
      switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {
        case "1":
          player.attack(monster); // 플레이어 공격
          logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
          if (monster.hp <= 0) {
            break;
          }
          if (monster.attackTurn === 1) {
            // 2스테이지는 2턴에 한번 공격
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            }
            monster.attackTurn = 0;
          } else {
            monster.attackTurn = 1;
            logs.push(chalk.yellow(`'${monster.name}'가 공격을 준비합니다!`));
          }
          break;

        case "2":
          logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
          if (monster.attackTurn === 1) {
            // 2스테이지는 2턴에 한번 공격
            logs.push(
              chalk.yellow(`'${monster.name}'의 공격이 머리 위를 스칩니다!`)
            );
            monster.attackTurn = 0;
          } else {
            monster.attackTurn = 1;
            logs.push(chalk.yellow(`'${monster.name}'가 공격을 준비합니다!`));
          }
          break;

        case "3":
          logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
          player.defence(monster);
          if (monster.attackTurn === 1) {
            if (player.def === 1) {
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              monster.attackTurn = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              monster.attackTurn = 1;
              break;
            }
          } else if (monster.attackTurn === 0) {
            logs.push(chalk.yellow(`'${monster.name}'가 공격을 준비합니다!`));
            monster.attackTurn = 1;
            break;
          }

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }
    if (stage === 3) {
      //stage 3 전투 진행
      switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {
        case "1":
          if (monster.attackTurn === 1) {
            player.attack(monster);
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
            logs.push(chalk.green(`'${monster.name}'가 공격하러 달려들다 피해를 입고 물러납니다!`));
            monster.attackTurn = 0;
            if (monster.hp <= 0) {
              break;
            }
          } else if (monster.attackTurn === 0) {
            logs.push(chalk.red(`'${monster.name}'가 공중에서 플레이어의 공격을 회피합니다!`));
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 회피 후 달려들어 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            }
            monster.hp += monster.randomDmg;
            logs.push(chalk.yellow(`'${monster.name}'가 ${monster.randomDmg}만큼 회복합니다!`));
            monster.attackTurn = 1;
          }
          break;
        case "2":
          if (monster.attackTurn === 1) {
            // 2스테이지는 2턴에 한번 공격
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어를 따라와 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            }
            monster.hp += monster.randomDmg;
            logs.push(chalk.red(`'${monster.name}'가 ${monster.randomDmg}만큼 회복합니다!`));
            monster.attackTurn = 0;
          } else if (monster.attackTurn === 0) {
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
            logs.push(chalk.yellow(`'${monster.name}'가 공중에서 플레이어를 노려봅니다.`)
            );
            monster.attackTurn = 1;
          }
          break;

        case "3":
          logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
          player.defence(monster);
          if (monster.attackTurn === 1) { //공격패턴
            if (player.def === 1) {  //방어 성공
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;  //방어확률 초기화
              monster.attackTurn = 0;  //공격패턴 -> 수비패턴 전환
              break;
            } else if (player.def === 0) { //방어 실패
              monster.attack(player);  //공격받음
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));  //피해입음
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              monster.hp += monster.randomDmg;  //(3스테이지) 몬스터 회복 패턴
              logs.push(chalk.red(`'${monster.name}'가 ${monster.randomDmg}만큼 회복합니다!`) // 회복 로그
              );
              monster.attackTurn = 1;
              break;
            }
          } else if (monster.attackTurn === 0) {
            logs.push(chalk.yellow(`'${monster.name}'가 공중에서 플레이어를 노려봅니다.`));
            monster.attackTurn = 1;
            break;
          }

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }
    if (stage === 4) {
      switch (
      choice
      ) {
        case "1":
          player.attack(monster); // 플레이어 공격
          logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
          if (monster.hp <= 0) {
            break;
          }
          monster.attack(player); // 몬스터 공격
          logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
          if (player.hp <= 0 && player.revive === 1) {
            player.hp = 10;
            player.revive = 0;
            logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
          }
          break;

        case "2":
          logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
          logs.push(chalk.red(`'${monster.name}'의 공격이 허공을 갈랐습니다!`));
          break;

        case "3":
          logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
          player.defence(monster);
          if (player.def === 1) {
            logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
            player.def = 0;
            break;
          } else if (player.def === 0) {
            monster.attack(player);
            logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            }
            break;
          }

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }
    if (stage === 5) {
      //stage 5 전투 진행
      switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {

        case "1":
          monster.curse(player);
          if (monster.cur === 0) {
            console.log(chalk.red("듀라한의 저주가 완성되어 당신을 파멸시킵니다."));
            await delay(2000);
            if (player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } else {
              player.hp = 0;
            }
            break;
          }
          monster.randomPattern(player);
          if (monster.attackTurn === 1 || monster.attackTurn === 2) {
            player.attack(monster);
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
            monster.attack(player); // 몬스터 공격
            logs.push(chalk.red(`'${monster.name}'이 낫을 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            }
            break;
          } else if (monster.attackTurn === 0 || monster.attackTurn === 3) {
            logs.push(chalk.red(`'${monster.name}'가 빠르게 달려서 공격을 회피합니다!`));
          }
          break;

        case "2":
          monster.curse(player);
          if (monster.cur === 0) {
            console.log(chalk.red("듀라한의 저주가 완성되어 당신을 파멸시킵니다."));
            await delay(2000);
            if (player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } else {
              player.hp = 0;
            }
            break;
          }
          monster.randomPattern(player);
          if (monster.attackTurn === 1 || monster.attackTurn === 2) {
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
            logs.push(chalk.red(`'${monster.name}'의 낫이 허공을 갈랐습니다!`));
          } else if (monster.attackTurn === 0 || monster.attackTurn === 3) {
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
            logs.push(chalk.yellow(`'${monster.name}'가 빠르게 달려갔습니다!`)
            );
          }
          break;

        case "3":
          monster.curse(player);
          if (monster.cur === 0) {
            console.log(chalk.red("듀라한의 저주가 완성되어 당신을 파멸시킵니다."));
            await delay(2000);
            if (player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } else {
              player.hp = 0;
            }
            break;
          }
          monster.randomPattern(player);
          logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
          player.defence(monster);
          if (monster.attackTurn === 1 || monster.attackTurn === 2) { //공격패턴
            if (player.def === 1) {  //방어 성공
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;  //방어확률 초기화
              break;
            } else if (player.def === 0) { //방어 실패
              monster.attack(player);  //공격받음
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 낫을 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));  //피해입음
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 0 || monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 빠르게 달려나갔습니다!`));
            monster.attackTurn = 1;
            break;
          }

        case "4":
          monster.curse(player);
          if (monster.cur === 0) {
            console.log(chalk.red("듀라한의 저주가 완성되어 당신을 파멸시킵니다."));
            await delay(2000);
            if (player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } else {
              player.hp = 0;
            }
            break;
          }
          monster.randomPattern(player);
          if (monster.attackTurn === 1 || monster.attackTurn === 2) {
            player.magic(monster);
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.skillDmg}만큼의 마법 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
            monster.attack(player); // 몬스터 공격
            logs.push(chalk.red(`'${monster.name}'이 낫을 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            }
            break;
          } else if (monster.attackTurn === 0 || monster.attackTurn === 3) {
            player.magic(monster);
            logs.push(chalk.green(`'${monster.name}'가 빠르게 달렸지만, 마탄이 적중해 ${player.skillDmg}만큼의 마법 피해를 입었습니다!`));
          }
          break;

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }
    if (stage === 6) {  //트리가드
      switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {
        case "1": // 휘두르기
          monster.randomPattern(player)  //패턴받기
          if (monster.attackTurn === 2 && monster.ready1 === 0 && monster.ready2 === 0) { //방어패턴이 걸리고, 공격, 속박패턴이 아닐 때
            logs.push(chalk.yellow(`${monster.name}'가 방어 자세를 취합니다!`));
            logs.push(chalk.red(`${monster.name}'가 플레이어의 공격을 방어했습니다!`));
            break;
          } else {
            player.attack(monster); // 플레이어 공격
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
            if (player.passive === 1) { //저주 패시브
              monster.atk -= 1
            }
          };
          if (monster.ready1 === 1) { // 공격패턴 발동
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 가지를 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            monster.ready1 = 0;
            break;
          } else if (monster.ready2 === 1) {
            logs.push(chalk.red(`플레이어가 뿌리에 잡혀 3턴동안 행동불능이 됩니다!`));
            for (let i = 1; i <= 3; i++) {
              monster.randomPattern(player)  //패턴받기
              if (monster.ready1 === 1) { //공격패턴 발동
                monster.attack(player);
                logs.push(chalk.red(`'${monster.name}'가 가지를 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
                if (player.hp <= 0 && player.revive === 1) {
                  player.hp = 10;
                  player.revive = 0;
                  logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
                } // 부활로직
                monster.ready1 = 0;
              } else if (monster.attackTurn === 0 || monster.attackTurn === 1) {
                logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 공격 준비를 합니다!`));
                monster.ready1 = 1
              } else if (monster.attackTurn === 2) {
                logs.push(chalk.yellow(`'${monster.name}'가 가지를 모아 방어했습니다!`));
              } else if (monster.attackTurn === 3) {
                logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
                monster.hp += 30;
              }
            }  //for, 대기패턴 끝
            monster.ready2 = 0;
          } else if (monster.attackTurn === 0) {  //0번패턴 (뿌리휘두르기)
            logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 플레이어를 공격할 준비를 합니다!`));
            monster.ready1 = 1;
          } else if (monster.attackTurn === 1) { //1번패턴 (옭아매기)
            logs.push(chalk.yellow(`'${monster.name}'가 뿌리를 뻗어 플레이어를 속박할 준비를 합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 3) { //3번패턴 (회복하기)
            logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
            monster.hp += 30;
          }
          break;

        case "2": //구르기
          monster.randomPattern(player)  //패턴받기
          if (monster.attackTurn === 2 && monster.ready1 === 0 && monster.ready2 === 0) { //방어패턴이 걸리고, 공격, 속박패턴이 아닐 때
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
            logs.push(chalk.yellow(`${monster.name}'가 방어 자세를 취합니다!`));
            break;
          } else {
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
          };
          if (monster.ready1 === 1) { // 공격패턴 발동
            logs.push(chalk.red(`'${monster.name}'가 휘두른 가지를 피했습니다!`));
            monster.ready1 = 0;
            break;
          } else if (monster.ready2 === 1) {
            logs.push(chalk.red(`플레이어가 땅을 굴렀지만, 뿌리에 잡혀 3턴동안 행동불능이 됩니다!`));
            for (let i = 1; i <= 3; i++) {
              monster.randomPattern(player)  //패턴받기
              if (monster.ready1 === 1) { //공격패턴 발동
                monster.attack(player);
                logs.push(chalk.red(`'${monster.name}'가 가지를 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
                if (player.hp <= 0 && player.revive === 1) {
                  player.hp = 10;
                  player.revive = 0;
                  logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
                } // 부활로직
                monster.ready1 = 0;
              } else if (monster.attackTurn === 0 || monster.attackTurn === 1) {
                logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 공격 준비를 합니다!`));
                monster.ready1 = 1
              } else if (monster.attackTurn === 2) {
                logs.push(chalk.yellow(`'${monster.name}'가 가지를 모아 방어했습니다!`));
              } else if (monster.attackTurn === 3) {
                logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
                monster.hp += 30;
              }
            }  //for, 대기패턴 끝
            monster.ready2 = 0;
          } else if (monster.attackTurn === 0) {  //0번패턴 (뿌리휘두르기)
            logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 플레이어를 공격할 준비를 합니다!`));
            monster.ready1 = 1;
          } else if (monster.attackTurn === 1) { //1번패턴 (옭아매기)
            logs.push(chalk.yellow(`'${monster.name}'가 뿌리를 뻗어 플레이어를 속박할 준비를 합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 3) { //3번패턴 (회복하기)
            logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
            monster.hp += 30;
          }
          break;

        case "3": //방어
          monster.randomPattern(player)  //패턴받기
          if (monster.attackTurn === 2 && monster.ready1 === 0 && monster.ready2 === 0) { //방어패턴이 걸리고, 공격, 속박패턴이 아닐 때
            logs.push(chalk.red(`플레이어가 방어 자세를 취합니다!`));
            logs.push(chalk.yellow(`${monster.name}'가 방어 자세를 취합니다!`));
            break;
          } else { //몬스터의 방어 패턴이 아닐 때
            logs.push(chalk.red(`플레이어가 방어 자세를 취합니다!`));
          };
          if (monster.ready1 === 1) { // 공격패턴 발동
            player.defence(monster);
            if (player.def === 1) {
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              monster.ready1 = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              monster.ready1 = 0;
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.ready2 === 1) { //속박패턴 발동
            player.defence(monster);
            if (player.def === 1) {
              logs.push(chalk.green(`방어 성공! '${monster.name}'의 옭아매기를 방어합니다!`));
              player.def = 0;
              monster.ready2 = 0;
              break;
            } else if (player.def === 0) {
              logs.push(chalk.red(`방어 실패! 플레이어가 뿌리에 잡혀 3턴동안 행동불능이 됩니다!`));
              for (let i = 1; i <= 3; i++) {
                monster.randomPattern(player)  //패턴받기
                if (monster.ready1 === 1) { //공격패턴 발동
                  monster.attack(player);
                  logs.push(chalk.red(`'${monster.name}'가 가지를 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
                  if (player.hp <= 0 && player.revive === 1) {
                    player.hp = 10;
                    player.revive = 0;
                    logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
                  } // 부활로직
                  monster.ready1 = 0;
                } else if (monster.attackTurn === 0 || monster.attackTurn === 1) {
                  logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 공격 준비를 합니다!`));
                  monster.ready1 = 1
                } else if (monster.attackTurn === 2) {
                  logs.push(chalk.yellow(`'${monster.name}'가 가지를 모아 방어했습니다!`));
                } else if (monster.attackTurn === 3) {
                  logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
                  monster.hp += 30;
                }
              }  //for, 대기패턴 끝
            }
            monster.ready2 = 0;
          } else if (monster.attackTurn === 0) {  //0번패턴 (뿌리휘두르기)
            logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 플레이어를 공격할 준비를 합니다!`));
            monster.ready1 = 1;
          } else if (monster.attackTurn === 1) { //1번패턴 (옭아매기)
            logs.push(chalk.yellow(`'${monster.name}'가 뿌리를 뻗어 플레이어를 속박할 준비를 합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 3) { //3번패턴 (회복하기)
            logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
            monster.hp += 30;
          }
          break;

        case "4": // 마탄 공격
          monster.randomPattern(player)  //패턴받기
          if (monster.attackTurn === 2 && monster.ready1 === 0 && monster.ready2 === 0) { //방어패턴이 걸리고, 공격, 속박패턴이 아닐 때
            logs.push(chalk.yellow(`${monster.name}'가 방어 자세를 취합니다!`));
            logs.push(chalk.red(`${monster.name}'가 플레이어의 마법 공격을 방어했습니다!`));
            break;
          } else {
            player.magic(monster); // 플레이어 공격
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 마법 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
          };
          if (monster.ready1 === 1) { // 공격패턴 발동
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 가지를 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            monster.ready1 = 0;
            break;
          } else if (monster.ready2 === 1) {
            logs.push(chalk.red(`플레이어가 뿌리에 잡혀 3턴동안 행동불능이 됩니다!`));
            for (let i = 1; i <= 3; i++) {
              monster.randomPattern(player)  //패턴받기
              if (monster.ready1 === 1) { //공격패턴 발동
                monster.attack(player);
                logs.push(chalk.red(`'${monster.name}'가 가지를 휘둘러 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
                if (player.hp <= 0 && player.revive === 1) {
                  player.hp = 10;
                  player.revive = 0;
                  logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
                } // 부활로직
                monster.ready1 = 0;
              } else if (monster.attackTurn === 0 || monster.attackTurn === 1) {
                logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 공격 준비를 합니다!`));
                monster.ready1 = 1
              } else if (monster.attackTurn === 2) {
                logs.push(chalk.yellow(`'${monster.name}'가 가지를 모아 방어했습니다!`));
              } else if (monster.attackTurn === 3) {
                logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
                monster.hp += 30;
              }
            }  //for, 대기패턴 끝
            monster.ready2 = 0;
          } else if (monster.attackTurn === 0) {  //0번패턴 (뿌리휘두르기)
            logs.push(chalk.yellow(`'${monster.name}'가 가지를 뻗어 플레이어를 공격할 준비를 합니다!`));
            monster.ready1 = 1;
          } else if (monster.attackTurn === 1) { //1번패턴 (옭아매기)
            logs.push(chalk.yellow(`'${monster.name}'가 뿌리를 뻗어 플레이어를 속박할 준비를 합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 3) { //3번패턴 (회복하기)
            logs.push(chalk.yellow(`'${monster.name}'가 땅의 기운을 흡수해 체력을 회복했습니다!`));
            monster.hp += 30;
          }
          break;

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }

    if (stage === 7) {  //마족 마법사
      switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {
        case "1": // 휘두르기
          monster.randomPattern(player)  //패턴받기
          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //마법사가 스턴상태일때
            player.attack(monster); // 플레이어 공격
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
            if (player.passive === 1) { //저주 패시브
              monster.atk -= 1
            }
            monster.ready1 -= 1  //스턴 턴 감소
            break;
          } else if (monster.ready1 === 0) {
            logs.push(chalk.yellow(`'${monster.name}'의 방어막에 공격이 막혔습니다!`));
          }//플레이어 패턴

          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //스턴 상태일때

          } else if (monster.ready2 === 1) { //마력포 장전시
            monster.attack(player);
            monster.attack(player);
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마력포를 발사했습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 3}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0;
          } else if (monster.ready3 === 1) {
            logs.push(chalk.red(`하늘에서 메테오가 떨어집니다!!!`));
            monster.attack(player);
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready3 = 0;
          } else if (monster.attackTurn === 0) {
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {
            logs.push(chalk.yellow(`'${monster.name}'가 캐스팅을 시작합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 정신을 집중하여 체력을 회복합니다!`));
            monster.hp += 30;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 하늘에서 무언가를 불러옵니다!`));
            monster.ready3 = 1;
          }
          break;

        case "2": //구르기
          monster.randomPattern(player)  //패턴받기
          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //마법사가 스턴상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
            monster.ready1 -= 1  //스턴 턴 감소
            break;
          } else if (monster.ready1 === 0) {
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
          }//플레이어 패턴

          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //스턴 상태일때

          } else if (monster.ready2 === 1) { //마력포 장전시
            monster.attack(player);
            monster.attack(player);
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마력포를 발사했습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 3}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0;
          } else if (monster.ready3 === 1) {
            logs.push(chalk.yellow(`하늘에서 메테오가 떨어집니다!!!`));
            logs.push(chalk.green(`플레이어가 땅을 굴러 가까스로 메테오를 피합니다!`));
            monster.ready3 = 0;
          } else if (monster.attackTurn === 0) {
            monster.attack(player)
            logs.push(chalk.red(`플레이어가 땅을 굴렀지만 마탄에 맞았습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {
            logs.push(chalk.yellow(`'${monster.name}'가 캐스팅을 시작합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 정신을 집중하여 체력을 회복합니다!`));
            monster.hp += 30;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 하늘에서 무언가를 불러옵니다!`));
            monster.ready3 = 1;
          }
          break;

        case "3": //방어
          monster.randomPattern(player)  //패턴받기
          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //마법사가 스턴상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
            monster.ready1 -= 1  //스턴 턴 감소
            break;
          } else if (monster.ready1 === 0) {
            logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
          }//플레이어 패턴

          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //스턴 상태일때


          } else if (monster.ready2 === 1) { //마력포 장전시
            monster.attack(player);
            monster.attack(player);
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마력포를 발사했습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 3}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0;
          } else if (monster.ready3 === 1) {
            logs.push(chalk.yellow(`하늘에서 메테오가 떨어집니다!!!`));
            monster.attack(player);
            monster.attack(player);
            logs.push(chalk.red(`방어했으나, 도저히 막을 수가 없습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready3 = 0;
          } else if (monster.attackTurn === 0) {
            player.defence(monster);
            if (player.def === 1) {
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 1) {
            logs.push(chalk.yellow(`'${monster.name}'가 캐스팅을 시작합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 정신을 집중하여 체력을 회복합니다!`));
            monster.hp += 30;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 하늘에서 무언가를 불러옵니다!`));
            monster.ready3 = 1;
          }
          break;

        case "4": // 마탄 공격
          monster.randomPattern(player)  //패턴받기
          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //마법사가 스턴상태일때
            player.magic(monster); // 플레이어 공격
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.skillDmg}만큼의 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
            monster.ready1 -= 1  //스턴 턴 감소
            break;
          } else if (monster.ready1 === 0) {
            logs.push(chalk.yellow(`'${monster.name}'의 방어막에 공격이 막혔습니다!`));
          }//플레이어 패턴

          if (monster.ready1 === 1 || monster.ready1 === 2 || monster.ready1 === 3) { //스턴 상태일때

          } else if (monster.ready2 === 1) { //마력포
            logs.push(chalk.green(`'${monster.name}'의 마력포를 플레이어가 무력화시켰습니다!`));
            logs.push(chalk.green(`'${monster.name}'가 3턴동안 혼란상태에 빠집니다!`));
            monster.ready2 = 0;
            monster.ready1 = 3;
          } else if (monster.ready3 === 1) {
            logs.push(chalk.yellow(`하늘에서 메테오가 떨어집니다!!!`));
            monster.attack(player);
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready3 = 0;
          } else if (monster.attackTurn === 0) {
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {
            logs.push(chalk.yellow(`'${monster.name}'가 캐스팅을 시작합니다!`));
            monster.ready2 = 1;
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 정신을 집중하여 체력을 회복합니다!`));
            monster.hp += 30;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 하늘에서 무언가를 불러옵니다!`));
            monster.ready3 = 1;
          }
          break;

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }

    if (stage === 8) {  //마족 정예병
      switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {
        case "1": // 휘두르기
          monster.randomPattern(player)  //패턴받기
          
            player.attack(monster); // 플레이어 공격
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
            if (player.passive === 1) { //저주 패시브
              monster.atk -= 1
            }//플레이어 패턴

          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0; //스턴 해제
          } else if (monster.ready3 === 1) { //분노
            if (monster.attackTurn === 0 || monster.attackTurn === 2) { //정예병 마탄
              monster.attack(player)
              if (player.hp <= 0) {
                player.hp = 1;
              } // 연타공격 버그픽스
              monster.attack(player)
              logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 마탄을 발사해, ${monster.randomDmg * 2}만큼의 마법 피해를 입혔습니다!`));
              monster.ready3 = 0;
              if (player.hp <= 0 || player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              } // 부활로직
            } else if (monster.attackTurn === 1 || monster.attackTurn === 3) {  // 정예병 휘두르기
              monster.attack(player);
              if (player.hp <= 0) {
                player.hp = 1;
              } // 연타공격 버그픽스
              monster.attack(player);
              logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 도끼를 휘둘렀습니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              } // 부활로직
              monster.ready3 = 0;
            }
            
          } else if (monster.ready2 === 1) { //내려찍기
            monster.attack(player);
            if (player.hp <= 0) {
              player.hp = 1;
            } // 연타공격 버그픽스
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 내려찍었습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0; //내려찍기 초기화
          } else if (monster.attackTurn === 0) { //정예병 마탄
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마탄을 발사해, ${monster.randomDmg}만큼의 마법 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {  // 정예병 휘두르기
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 휘둘렀습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 분노하여 일시적으로 힘이 세집니다!`));
            monster.ready3 = 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 도끼를 하늘 높이 치켜듭니다!`));
            monster.ready2 = 1;
          }
          break;

        case "2": //구르기
          monster.randomPattern(player)  //패턴받기
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
             //플레이어 패턴

          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0; //스턴 해제 
          } else if (monster.ready3 === 1) { //분노
            if (monster.attackTurn === 0 || monster.attackTurn === 2) { //정예병 마탄
              monster.attack(player)
              if (player.hp <= 0) {
                player.hp = 1;
              } // 연타공격 버그픽스
              monster.attack(player)
              logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 마탄을 발사했습니다!`));
              logs.push(chalk.red(`플레이어가 땅을 굴렀으나 마탄에 맞아 ${monster.randomDmg * 2}만큼의 마법 피해를 입었습니다!`));
              monster.ready3 = 0;
              if (player.hp <= 0 || player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              } // 부활로직
            } else if (monster.attackTurn === 1 || monster.attackTurn === 3) {  // 정예병 휘두르기
              logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 도끼를 휘둘렀습니다!`));
              logs.push(chalk.green(`플레이어 머리 위로 '${monster.name}'의 도끼가 스쳐지나갑니다!`));
              monster.ready3 = 0;
            }
          } else if (monster.ready2 === 1) { //내려찍기
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 내려찍었습니다!`));
            logs.push(chalk.green(`플레이어가 땅을 굴러 도끼를 피했습니다!`));
            logs.push(chalk.green(`'${monster.name}'가 땅에 박힌 도끼를 뽑기위해 한턴 스턴상태가 됩니다!`));
            monster.ready2 = 0; //내려찍기 초기화
            monster.ready1 = 1; //스턴
          } else if (monster.attackTurn === 0) { //정예병 마탄
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마탄을 발사했습니다!`));
            logs.push(chalk.red(`플레이어가 땅을 굴렀으나 마탄에 맞아 ${monster.randomDmg}만큼의 마법 피해를 입었습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {  // 정예병 휘두르기
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 휘둘렀습니다!`));
            logs.push(chalk.green(`플레이어가 땅을 굴러 도끼를 피했습니다!`));
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 분노하여 일시적으로 힘이 세집니다!`));
            monster.ready3 = 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 도끼를 하늘 높이 치켜듭니다!`));
            monster.ready2 = 1;
          }
          break;

        case "3": //방어
          monster.randomPattern(player)  //패턴받기
            
          //플레이어 패턴

          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0;
          } else if (monster.ready3 === 1) { //분노
            if (monster.attackTurn === 0 || monster.attackTurn === 2) { //정예병 마탄
              player.defence(monster);  //방어로직
              if (player.def === 1) { //방어 성공
                logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
                logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 마탄을 발사했습니다!`));
                logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
                player.def = 0;
                monster.ready3 = 0;
                break;
              } else if (player.def === 0) { // 방어 실패
                monster.attack(player);
                if (player.hp <= 0) {
                  player.hp = 1;
                } // 연타공격 버그픽스
                monster.attack(player);
                logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
                logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 마탄을 발사했습니다!`));
                logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 마법 피해를 입혔습니다!`));
                if (player.hp <= 0 && player.revive === 1) {
                  player.hp = 10;
                  player.revive = 0;
                  logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
                }
                monster.ready3 = 0;
                break;
              }
            } else if (monster.attackTurn === 1 || monster.attackTurn === 3) {  // 정예병 휘두르기
              player.defence(monster);  //방어로직
              if (player.def === 1) { //방어 성공
                logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
                logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 도끼를 휘둘렀습니다!`));
                logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
                player.def = 0;
                monster.ready3 = 0;
                break;
              } else if (player.def === 0) {
                monster.attack(player);
                if (player.hp <= 0) {
                  player.hp = 1;
                } // 연타공격 버그픽스
                monster.attack(player);
                logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
                logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 도끼를 휘둘렀습니다!`));
                logs.push(chalk.red(`방어 실패! '${monster.name}'가 분노한 채 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
                if (player.hp <= 0 && player.revive === 1) {
                  player.hp = 10;
                  player.revive = 0;
                  logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
                }
                monster.ready3 = 0;
                break;
              }
            }
          } else if (monster.ready2 === 1) { //내려찍기
            player.defence(monster);  //방어로직
            if (player.def === 1) { //방어 성공
              logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 내려찍었습니다!`));
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              monster.ready2 = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 내려찍었습니다!`));
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              monster.ready2 = 0; //내려찍기 초기화
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 0) { //정예병 마탄
            player.defence(monster);  //방어로직
            if (player.def === 1) { //방어 성공
              logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마탄을 발사했습니다!`));
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마탄을 발사했습니다!`));
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 1) {  // 정예병 휘두르기
            player.defence(monster);  //방어로직
            if (player.def === 1) { //방어 성공
              logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 휘둘렀습니다!`));
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 휘둘렀습니다!`));
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 분노하여 일시적으로 힘이 세집니다!`));
            monster.ready3 = 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 도끼를 하늘 높이 치켜듭니다!`));
            monster.ready2 = 1;
          }
          break;

        case "4": // 마탄 공격  
          monster.randomPattern(player)  //패턴받기
            player.magic(monster); // 플레이어 공격
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.skillDmg}만큼의 피해를 입혔습니다!`));
            if (monster.hp <= 0) {  // 몬스터 죽음!
              break;
            }//플레이어 패턴
          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0;
          } else if (monster.ready3 === 1) { //분노
            if (monster.attackTurn === 0 || monster.attackTurn === 2) { //정예병 마탄
              monster.attack(player)
              if (player.hp <= 0) {
                player.hp = 1;
              } // 연타공격 버그픽스
              monster.attack(player)
              logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 마탄을 발사해, ${monster.randomDmg * 2}만큼의 마법 피해를 입혔습니다!`));
              monster.ready3 = 0;
              if (player.hp <= 0 || player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              } // 부활로직
            } else if (monster.attackTurn === 1 || monster.attackTurn === 3) {  // 정예병 휘두르기
              monster.attack(player);
              if (player.hp <= 0) {
                player.hp = 1;
              } // 부활로직
              monster.attack(player);
              logs.push(chalk.red(`'${monster.name}'가 분노한 채 플레이어에게 도끼를 휘둘렀습니다!`));
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              } // 부활로직
              monster.ready3 = 0;
            }
          } else if (monster.ready2 === 1) { //내려찍기
            monster.attack(player);
            if (player.hp <= 0) {
              player.hp = 1;
            } // 연타공격 버그픽스
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 내려찍었습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0; //내려찍기 초기화
          } else if (monster.attackTurn === 0) { //정예병 마탄
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 마탄을 발사해, ${monster.randomDmg}만큼의 마법 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {  // 정예병 휘두르기
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 도끼를 휘둘렀습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 분노하여 일시적으로 힘이 세집니다!`));
            monster.ready3 = 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 도끼를 하늘 높이 치켜듭니다!`));
            monster.ready2 = 1;
          }
          break;

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }

    if (stage === 9) {  // 타락한 여기사 
    switch (
      choice //선택받았을때 실행  switch ~ case break -> 여러 기능을 넣기 편함
      ) {
        case "1": // 휘두르기
          monster.randomPattern(player)  //패턴받기
          
            player.attack(monster); // 플레이어 공격
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.randomDmg}만큼의 피해를 입혔습니다!`));
            if (monster.hp <= 0) {
              break;
            }
            if (player.passive === 1) { //저주 패시브
              monster.atk -= 1
            }
            if (monster.atk === 0) {
              monster.hp = 0
              break;
            } //여기사 공격력 0
            
            //플레이어 패턴

          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0; //스턴 해제
          } else if (monster.ready2 === 1) { //여기사 강공
            monster.attack(player);  //1타
            if (player.hp <= 0) {
              player.hp = 1;
            } // 연타공격 버그픽스
            monster.attack(player);  //2타
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 신성력을 방출했습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0; //강공 초기화
          } else if (monster.attackTurn === 0) { //검기
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 검기을 발사해, ${monster.randomDmg}만큼의 마법 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {  // 성검 휘두르기
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 성검을 휘둘렀습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 마왕의 저주에 고통스러워합니다!`));
            logs.push(chalk.yellow(`'${monster.name}'가 전투 의지를 조금 잃어버립니다!`));
            monster.atk -= 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 성검에 신성력을 가득 담습니다!`));
            monster.ready2 = 1;
          }
          break;

        case "2": //구르기
          monster.randomPattern(player)  //패턴받기
            logs.push(chalk.green(`플레이어가 땅을 굴렀습니다!`));
             //플레이어 패턴

          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0; //스턴 해제 
          } else if (monster.ready2 === 1) { //강공
            monster.attack(player);  //1타
            if (player.hp <= 0) {
              player.hp = 1;
            } // 연타공격 버그픽스
            monster.attack(player);  //2타
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 신성력을 방출했습니다!`));
            logs.push(chalk.red(`플레이어가 땅을 굴렀으나 피할 수 없었습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0; //강공 초기화
          } else if (monster.attackTurn === 0) { //검기
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 검기를 발사했습니다!`));
            logs.push(chalk.red(`플레이어가 땅을 굴렀으나 검기에 맞아 ${monster.randomDmg}만큼의 마법 피해를 입었습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {  // 휘두르기
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 성검을 휘둘렀습니다!`));
            logs.push(chalk.green(`플레이어가 땅을 굴러 성검을 피했습니다!`));
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 마왕의 저주에 고통스러워합니다!`));
            logs.push(chalk.yellow(`'${monster.name}'가 전투 의지를 조금 잃어버립니다!`));
            monster.atk -= 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 성검에 신성력을 가득 담습니다!`));
            monster.ready2 = 1;
          }
          break;

        case "3": //방어
          monster.randomPattern(player)  //패턴받기
          logs.push(chalk.green(`플레이어가 방어 자세를 취합니다!`));
          //플레이어 패턴

          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0;
          } else if (monster.ready2 === 1) { //강공
            player.defence(monster);  //방어로직
            if (player.def === 1) { //방어 성공
              
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 신성력을 방출했습니다!`));
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              monster.ready2 = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 신성력을 방출했습니다!`));
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              monster.ready2 = 0; //강공 초기화
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 0) { //검기
            player.defence(monster);  //방어로직
            if (player.def === 1) { //방어 성공
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 검기를 발사했습니다!`));
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 검기를 발사했습니다!`));
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 1) {  // 휘두르기
            player.defence(monster);  //방어로직
            if (player.def === 1) { //방어 성공
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 성검을 휘둘렀습니다!`));
              logs.push(chalk.green(`방어 성공! 데미지를 흡수합니다!`));
              player.def = 0;
              break;
            } else if (player.def === 0) {
              monster.attack(player);
              logs.push(chalk.red(`'${monster.name}'가 플레이어에게 성검을 휘둘렀습니다!`));
              logs.push(chalk.red(`방어 실패! '${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
              if (player.hp <= 0 && player.revive === 1) {
                player.hp = 10;
                player.revive = 0;
                logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
              }
              break;
            }
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 마왕의 저주에 고통스러워합니다!`));
            logs.push(chalk.yellow(`'${monster.name}'가 전투 의지를 조금 잃어버립니다!`));
            monster.atk -= 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 성검에 신성력을 가득 담습니다!`));
            monster.ready2 = 1;
          }
          break;

        case "4": // 마탄 공격  
          monster.randomPattern(player)  //패턴받기
            player.magic(monster); // 플레이어 공격
            logs.push(chalk.green(`플레이어가 '${monster.name}'에게 ${player.skillDmg}만큼의 마법 피해를 입혔습니다!`));
            if (monster.hp <= 0) {  // 몬스터 죽음!
              break;
            }
            logs.push(chalk.red(`'${monster.name}'가 마탄에 맞아 마력을 회복합니다.`));
            logs.push(chalk.red(`'${monster.name}'의 공격력이 증가합니다.`));
            monster.atk += 1;
            //플레이어 패턴


          if (monster.ready1 === 1) { //스턴 상태일때
            logs.push(chalk.green(`'${monster.name}'가 아직 스턴상태입니다!`));
            monster.ready1 = 0;
          } else if (monster.ready2 === 1) { //강공
            monster.attack(player);
            if (player.hp <= 0) {
              player.hp = 1;
            } // 연타공격 버그픽스
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 신성력을 방출했습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg * 2}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
            monster.ready2 = 0; //내려찍기 초기화
          } else if (monster.attackTurn === 0) { //검기
            monster.attack(player)
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 검기를 발사해, ${monster.randomDmg}만큼의 마법 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 1) {  // 정예병 휘두르기
            monster.attack(player);
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 성검을 휘둘렀습니다!`));
            logs.push(chalk.red(`'${monster.name}'가 플레이어에게 ${monster.randomDmg}만큼의 피해를 입혔습니다!`));
            if (player.hp <= 0 && player.revive === 1) {
              player.hp = 10;
              player.revive = 0;
              logs.push(chalk.yellow(`'고블린의 집념'을 사용해 적의 공격에 한번 저항합니다!`));
            } // 부활로직
          } else if (monster.attackTurn === 2) {
            logs.push(chalk.yellow(`'${monster.name}'가 마왕의 저주에 고통스러워합니다!`));
            logs.push(chalk.yellow(`'${monster.name}'가 전투 의지를 조금 잃어버립니다!`));
            monster.atk -= 1;
          } else if (monster.attackTurn === 3) {
            logs.push(chalk.yellow(`'${monster.name}'가 성검에 신성력을 가득 담습니다!`));
            monster.ready2 = 1;
          }
          break;

        case "9":
          monster.hp = 0;
          break;

        case "0":
          player.hp = 0;
          console.log(chalk.red("당신은 도망쳤습니다."));
          await delay(500);
          console.log(chalk.red("언데드로 환생한 당신은 어디에도 가지 못하고 세상을 떠돌다가,"));
          console.log(chalk.red("마왕의 부하에게 발각당해 살해당합니다."));
          await delay(1000);
      }
    }



    if (player.hp <= 0 && player.revive === 0) {
      console.clear();
      displayStatus(stage, player, monster);
      console.log(chalk.red("게임 오버!"));
      console.log(chalk.red("당신은 죽었습니다."));
      await delay(2000);
      displayLobby(); // server로 이동 어떻게...?
      break;
    } else if (monster.hp <= 0) {
      console.clear();
      displayStatus(stage, player, monster);

      if (stage === 1) {
        console.log(chalk.yellow(`'${monster.name}'이 쓰러졌습니다!`));
        console.log(chalk.yellow(`고블린의 정수 '집념'을 흡수했습니다! 스킬 '집념'(hp가 0이 되었을 때, 1턴 생존가능)을 획득합니다.`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("1스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 2) {
        console.log(chalk.yellow(`'${monster.name}'가 쓰러졌습니다!`));
        console.log(chalk.yellow(`오크의 정수 '괴력'을 흡수했습니다! 공격력이 증가합니다!`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("2스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 3) {
        console.log(chalk.yellow(`'${monster.name}'가 쓰러졌습니다!`));
        console.log(chalk.yellow(`뱀파이어의 정수 '흡혈'을 흡수했습니다! 휘두르기 피해량의 10%를 회복합니다.`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("3스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 4) {
        console.log(chalk.yellow(`'${monster.name}'이 쓰러졌습니다!`));
        console.log(chalk.yellow(`마족 병사의 정수 '마탄'을 흡수했습니다! 새로운 스킬, 마탄을 획득했습니다!`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("4스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 5) {
        console.log(chalk.yellow(`'${monster.name}'가 쓰러졌습니다!`));
        console.log(chalk.yellow(`듀라한의 정수 '저주'를 흡수했습니다! 공격 성공시, 적의 atk가 감소합니다.`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("5스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 6) {
        console.log(chalk.yellow(`'${monster.name}'가 쓰러졌습니다!`));
        console.log(chalk.yellow(`트리가드의 정수 '묘목'을 흡수했습니다! 휘두르기 시, 일정 확률로 묘목이 추가 공격을 합니다.`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("6스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 7) {
        console.log(chalk.yellow(`'${monster.name}'가 쓰러졌습니다!`));
        console.log(chalk.yellow(`마족 마법사의 정수 '마법'을 흡수했습니다! 마탄의 공격력이 증가합니다!`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("7스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 8) {
        console.log(chalk.yellow(`'${monster.name}'이 쓰러졌습니다!`));
        console.log(chalk.yellow(`마족 정예병의 정수 '분노'를 흡수했습니다! 치명타 피해를 입혔을 때, 적을 한턴 행동불능에 빠뜨립니다!`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("8스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 9) {
        console.log(chalk.yellow(`'${monster.name}'가 쓰러졌습니다!`));
        console.log(chalk.yellow(`타락한 여기사의 '성검'을 획득하였습니다! 휘두르기의 데미지가 크게 증가합니다.`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        console.log(chalk.green("다음 스테이지 준비 중..."));
        await delay(1000);
        console.clear();
        console.log(chalk.green("9스테이지 이후 스토리 전개"));
        await delay(2000);
      }
      if (stage === 10) {
        console.log(chalk.yellow(`'${monster.name}'이 쓰러졌습니다!`));
        await delay(1000);
        console.clear();
        console.log(chalk.green("전투 승리!"));
        await delay(1000);
        console.clear();
        console.log(chalk.green("마지막 스토리 전개"));
        await delay(2000);
      }

      break;
    }
  }
};

function nextStage(player, stage) {
  player.hp = 80 + 20 * stage; //플레이어 체력 회복, 최대치 증가
  //몬스터의 체력과 공격력은, 스테이지마다 다른 전투패턴 때문에 직접 지정
}

export async function startGame() {
  //server에서 1입력하면 여기로 여기서 플레이어의 체력, 공격력, 몬스터의 체력, 공격력 배정
  console.clear();
  console.log(chalk.yellow(`게임 시작 문구`));
  await delay(100);
  const player = new Player(100, 20); //플레이어의 체력, 공격력 배정
  let stage = 1; //스테이지 1불러오기
  let monster;

  while (stage <= 10) {
    //각 스테이지 시작
    nextStage(player, stage);
    switch (stage) {
      case 1:
        monster = new Monster("고블린", 100, 15);  //고블린의 정수 '끈기'를 흡수했습니다! 스킬 '집념'(hp가 0이 되었을 때, 즉시 hp 10을 회복합니다.)을 획득합니다.
        await battle(stage, player, monster);
        stage++;
        break;
      case 2:
        monster = new Monster("상처입은 오크", 200, 50); //오크의 정수 '괴력'을 흡수했습니다! 공격력이 증가합니다!
        player.revive = 1; //부활 획득!
        await battle(stage, player, monster);
        stage++;
        break;
      case 3:
        monster = new Monster("도망치는 뱀파이어", 100, 20); //뱀파이어의 정수 '흡혈'을 흡수했습니다! 입힌 피해량의 10%를 회복합니다.
        player.atk = 30;
        await battle(stage, player, monster);
        stage++;
        break;
      case 4:
        monster = new Monster("부상당한 마족병사", 200, 20); //마족병사의 정수 '마탄'을 흡수했습니다! 새로운 스킬, 마탄을 획득했습니다!(공격력은 약하지만, 100% 확정타)
        player.drain = 1; //흡혈 획득!
        await battle(stage, player, monster);
        stage++;
        break;
      case 5:
        monster = new Monster("낫을 든 듀라한", 150, 20); //듀라한의 정수 '저주'를 흡수했습니다! 공격 성공시, 적의 atk(1?)가 감소합니다.
        player.skill = 1; //마탄 획득!
        await battle(stage, player, monster);
        stage++;
        break;
      case 6:
        monster = new Monster("오염된 트리가드", 300, 50); //트리가드의 정수 '묘목'을 흡수했습니다! 휘두르기 시, 일정 확률로 묘목이 추가 공격을 합니다.
        player.passive = 1; // 저주 획득!
        await battle(stage, player, monster);
        stage++;
        break;
      case 7:
        monster = new Monster("마족 마법사", 300, 30); //마족 마법사의 정수 '마법'을 흡수했습니다! 마탄의 공격력이 증가합니다!
        player.doubleAtk = 1; // 묘목 획득!
        await battle(stage, player, monster);
        stage++;
        break;
      case 8:
        monster = new Monster("마족 정예병", 500, 30); //마족 정예병의 정수 '분노'를 흡수했습니다! 치명타 피해를 입혔을 때, 적을 한턴 행동불능에 빠뜨립니다!
        player.skillDmg = 30;
        await battle(stage, player, monster);
        stage++;
        break;
      case 9:
        monster = new Monster("타락한 여기사", 5000, 30); //타락한 여기사의 '성검'을 획득하였습니다! 휘두르기의 데미지가 크게 증가합니다.
        player.anger = 1;
        await battle(stage, player, monster);
        stage++;
        break;
      case 10:
        monster = new Monster("BOSS 마왕", 500, 50);
        player.atk = 100;
        await battle(stage, player, monster);
        stage++;
        break;
    }
    //다음 스테이지
  }
}
