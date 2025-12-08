## Blackjack (GitHub Readme Game)
Test your luck and strategy in this classic card game. Your goal is to get as close to 21 as possible without going over.

Choose Your Action:
- Hit 🎴: Draw another card.
- Stand 🛑: Keep your current hand.
- New Game 🔄: Start a new game and clear the board.

Ready to play? Click one of the buttons below to make your move and submit your choice! 🍀

<!-- blackjack-area -->

## Dealer
<div>

<table>
  <tr>
    <th></th>
    <th>Card #1</th><th>Card #2</th>
    <th>Summary</th>
  </tr>
  <tr>
    <td><strong>Cards</strong></td>
    <td align="center"><img width="75" src="assets/cards/9C.svg" alt="9c"></td><td><img width="75" src="assets/cards/AC.svg" alt="Ac"></td>
    <td align="center">✔️</td>
  </tr>
  <tr>
    <td><strong>Values</strong></td>
    <td align="center">9</td><td align="center">11</td>
    <td align="center">20</td>
  </tr>
</table>
  
</div>

## Player
<div>

<table>
  <tr>
    <th></th>
    <th>Card #1</th><th>Card #2</th><th>Card #3</th><th>Card #4</th>
    <th>Summary</th>
  </tr>
  <tr>
    <td><strong>Cards</strong></td>
    <td align="center"><img width="75" src="assets/cards/QC.svg" alt="Qc"></td><td><img width="75" src="assets/cards/AD.svg" alt="Ad"></td><td><img width="75" src="assets/cards/5C.svg" alt="5c"></td><td><img width="75" src="assets/cards/KS.svg" alt="Ks"></td>
    <td align="center">❌</td>
  </tr>
  <tr>
    <td><strong>Values</strong></td>
    <td align="center">10</td><td align="center">1</td><td align="center">5</td><td align="center">10</td>
    <td align="center">26</td>
  </tr>
</table>
  
</div>

## Game History
| Action | Events | Actor |
| ------ | ------ | ----- |
| New Game || <a href='https://github.com/lulunac27a'>lulunac27a</a> |
| Hit || <a href='https://github.com/lulunac27a'>lulunac27a</a> |
| ↳ | Player: Draw Card ||
| Hit || <a href='https://github.com/antoniooodev'>antoniooodev</a> |
| ↳ | Player: Draw Card ||
| ↳ | Dealer won: Player busted ||
| ↳ | Dealer: Reveal Hole Card ||
| ↳ | Game Finished: Thank you for playing! ||

<!-- /blackjack-area -->

##

### Game Commands

<div>

[![Hit Button](https://img.shields.io/badge/Hit-224D42?style=for-the-badge)](https://github.com/agonyz/readme-blackjack/issues/new?body=Please%20don%27t%20change%20anything%20in%20this%20issue.%20To%20execute%20your%20action%20simply%20submit%20the%20issue.&title=Blackjack:%20Hit)
[![Stand Button](https://img.shields.io/badge/Stand-ffc107?style=for-the-badge)](https://github.com/agonyz/readme-blackjack/issues/new?body=Please%20don%27t%20change%20anything%20in%20this%20issue.%20To%20execute%20your%20action%20simply%20submit%20the%20issue.&title=Blackjack:%20Stand)
[![Start new Game Button](https://img.shields.io/badge/New%20Game-701F18?style=for-the-badge)](https://github.com/agonyz/readme-blackjack/issues/new?body=Please%20don%27t%20change%20anything%20in%20this%20issue.%20To%20execute%20your%20action%20simply%20submit%20the%20issue.&title=Blackjack:%20New%20Game)

</div>

###

<details><summary>How it works</summary>

When you click on a link, it will create and submit a new GitHub issue with the desired action. This action triggers a GitHub workflow, which runs a small Typescript script responsible for executing the specified action in the blackjack game. The script then updates the content of the README file to reflect the current game state and commits the changes back to the repository.

</details>

<details><summary>Questions/Bugs/Ideas</summary>

If you have any questions, encounter any bugs or have ideas to improve the game, you can simply create an issue and mention me.

</details>