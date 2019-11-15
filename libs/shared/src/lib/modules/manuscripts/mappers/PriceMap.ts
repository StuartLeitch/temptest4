import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Price} from '../domain/Price';
import {PriceValue} from '../domain/PriceValue';
// import {ArtistMap} from './ArtistMap';
// import {AlbumMap} from './AlbumMap';
// import {TraderId} from '../../trading/domain/traderId';

export class PriceMap extends Mapper<Price> {
  public static toDomain(raw: any): Price {
    const priceOrError = Price.create(
      {
        value: PriceValue.create(raw.value).getValue()
        // traderId: TraderId.create(raw.trader_id),
        // artist: ArtistMap.toDomain(raw.Artist),
        // album: AlbumMap.toDomain(raw.Album)
      },
      new UniqueEntityID(raw.id)
    );

    priceOrError.isFailure ? console.log(priceOrError) : '';

    return priceOrError.isSuccess ? priceOrError.getValue() : null;
  }

  public static toPersistence(price: Price): any {
    return {
      id: price.id.toString(),
      value: price.props.value
      // artist_id: vinyl.artist.artistId.id.toString(),
      // album_id: vinyl.album.id.toString(),
      // notes: vinyl.vinylNotes.value
    };
  }
}
