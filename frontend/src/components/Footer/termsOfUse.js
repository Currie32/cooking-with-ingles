import styled from 'styled-components';


const StyledTitle = styled.div`
  margin-top: 100px;
  margin-bottom: 30px;
  font-size: 40px;
  font-weight: 400;
  color: rgba(0, 44, 25, 0.98);
  text-align: center;
  @media (max-width: 959px) {font-size: 32px}
  @media (max-width: 599px) {font-size: 26px}
`;


export default function PageTermsOfUse() {

  return (
    <div>
      <StyledTitle>
        Terms of Use
      </StyledTitle>
      <div>
        Effective date: 1 April 2022
      </div>
      <div>
        Email: david.currie32@gmail.com
      </div>
      <br/>
      <div>
        Welcome to Cooking With Ingles! Please read on to learn the rules and restrictions that govern your use of our website(s), products, services and applications (the “Services”). If you have any questions, comments, or concerns regarding these terms or the Services, please contact us at david.currie32@gmail.com
      </div>
      <br/>
      <div>
        1. Add recipes that might be fun to cook.
      </div>
      <div>
        2. Share the best recipes with people you like.
      </div>
      <div>
        3. Repeat
      </div>
    </div>
  )
};
